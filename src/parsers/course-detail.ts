import { JSDOM } from 'jsdom';
import { Prerequisite } from '../models/course';
import { decode } from 'he';
import { oneLine } from 'common-tags';
import { formDecode } from '../utilities';

/** A simple interface that extends an array */
export interface ParseTree extends Array<string | ParseTree> {
  [key: number]: string | ParseTree,
}

/**
 * Takes in the HTML inside of the `<td class="ntdefault">` and grabs the description. All HTML is
 * escaped and the line breaks are removed.
 */
export function parseDescription(bodyHtml: string) {
  /** grabs the top of the course detail which includes the description and the types of hours */
  const firstMatch = /([\s\S]*)<br.*\/?>[\s\S]*hour/.exec(bodyHtml);
  if (!firstMatch) { return undefined;}
  // the first capturing group
  const firstPass = firstMatch[1];
  // tries to remove any extra lines in that includes `<br /> 3.000 OR 4.000 Credit hours`
  const secondMatch = firstPass.search(/<br.*\/?>[\s\S]*hour/);
  const descriptionHtmlEncoded = (/*if*/ secondMatch === -1
    ? firstPass
    : firstPass.substring(0, secondMatch)
  );

  const arr = [decode(descriptionHtmlEncoded).trim()];
  return oneLine(Object.assign(arr, { raw: arr }));
}

/**
 * Given the HTML containing the prerequisites, this function will find all the anchors denoting
 * course in the catalog and replace them with a `__SUBJECT-CODE|COURSE-NUMBER__` directive. This
 * directive will be parsed out later.
 */
export function replacePrerequisiteAnchors(prerequisiteHtml: string) {
  const document = new JSDOM(prerequisiteHtml).window.document;
  const anchors = (Array
    .from(document.querySelectorAll('a')).filter(link => {
      const query = link.href.split('?')[1];
      if (!query) {
        return false;
      }
      const decoded = formDecode(query);
      if (!decoded.one_subj) { return false; }
      if (!decoded.sel_crse_strt) { return false; }
      return true;
    })
    .map(anchor => {
      const query = anchor.href.split('?')[1];
      const decoded = formDecode(query);
      return { anchor, subjectCode: decoded.one_subj, courseNumber: decoded.sel_crse_strt };
    })
  );

  for (const { anchor, subjectCode, courseNumber } of anchors) {
    const anchorParent = anchor.parentElement;
    if (!anchorParent) {
      throw new Error(`Anchor parent was null`); // should never happen
    }
    // replaces the anchor with an easily parsed string directive
    anchorParent.replaceChild(
      document.createTextNode(`__${subjectCode}|${courseNumber}__`),
      anchor
    );
  }

  const arr = [document.body.textContent || ''];
  const textContent = oneLine(Object.assign(arr, { raw: arr }))
  return textContent;
}

/**
 * Recursive function that takes in a string which can include `(` `)` and transforms it into an
 * array of arrays. Strings get separated by spaces and substrings inside of `(` `)` will get put
 * into a sub array:
 * 
 * e.g.:
 * 
 * ```txt
 * the quick (brown (fox jumps) over the (lazy dog))
 * ```
 * 
 * becomes:
 * 
 * ```js
 * ['the', 'quick', ['brown', ['fox', 'jumps'], 'over', 'the', ['lazy', 'dog']]]
 * ```
 */
export function transformParenthesesToTree(
  expression: string
): { tree: ParseTree, lastIndex: number } {
  const characters = expression.split('');
  const tokens = [] as ParseTree;
  let i = 0;
  let currentToken = '';
  while (i < expression.length) {
    const character = characters[i];
    if (character === ' ') { // terminal character
      if (currentToken) { // check to see if the `currentToken` is falsy
        tokens.push(currentToken);
        currentToken = '';
      }
    } else if (character === '(') {
      const subExpressionResult = transformParenthesesToTree(expression.substring(i + 1));
      i += subExpressionResult.lastIndex;
      tokens.push(subExpressionResult.tree);
    } else if (character === ')') { // also terminal character but returns the sub expression
      if (currentToken) { // check to see if the `currentToken` is falsy
        tokens.push(currentToken);
      }
      return { tree: tokens, lastIndex: i + 1 };
    } else {
      currentToken += character;
    }
    i += 1;
  }

  if (currentToken) { // adds the last current token if there is one
    tokens.push(currentToken);
  }

  return { tree: tokens, lastIndex: i };
}

/**
 * If the string provided matches `/__(.*)\|(.*)__/` (e.g. `blah __CIS|310__ blah`) then the
 * function will return just the `__CIS|310__` and leave out the `blah blah`
 */
export function replaceCourseDirectiveInToken(token: string) {
  const match = /__(.*)\|(.*)__/.exec(token);
  if (!match) {
    return token;
  }
  const subjectCode = match[1].trim().toUpperCase();
  const courseNumber = match[2].trim().toUpperCase();

  return `__${subjectCode}|${courseNumber}__`;
}

/**
 * Joins strings in an array tree based on whether or not they are operators (i.e. `and` or `or`).
 * 
 * transforms:
 * ```
 * ['one', 'two', 'and', ['buckle', 'shoe', 'or', 'three', 'four']]
 * ```
 * 
 * into:
 * ```
 * ['one two', 'and', ['buckle shoe', 'or', 'three four']]
 * ```
 */
export function tokenizeByOperator(tree: ParseTree): ParseTree {
  const newTree = [] as ParseTree;
  let currentToken = '';
  for (const node of tree) {
    if (Array.isArray(node)) {
      newTree.push(tokenizeByOperator(node))
    } else if (node.toLowerCase() === 'and' || node.toLowerCase() === 'or') {
      if (currentToken) {
        newTree.push(replaceCourseDirectiveInToken(currentToken.trim()));
      }
      newTree.push(node);
      currentToken = '';
    } else {
      currentToken += ' ' + node;
    }
  }
  if (currentToken) {
    newTree.push(replaceCourseDirectiveInToken(currentToken.trim()));
  }
  return newTree;
}

/**
 * Recursively builds the `_Prerequisite` type given a `ParseTree` from the `tokenizeByOperator`
 * function.
 */
export function buildPrerequisiteTree(tokens: ParseTree): Prerequisite {
  let logicGateSetOnce = false;
  let currentPrerequisite: Prerequisite = {
    g: '|',
    o: [] as Prerequisite[]
  };

  for (const token of tokens) {
    if (token === 'and' || token === 'or') {
      const gate = /*if*/ token === 'and' ? '&' : '|';
      if (!logicGateSetOnce) {
        logicGateSetOnce = true;
        currentPrerequisite.g = gate;
      } else if (gate === currentPrerequisite.g) {
        continue;
      } else {
        let previousPrerequisite = currentPrerequisite;
        currentPrerequisite = {
          g: gate,
          o: [],
        };
        currentPrerequisite.o.push(previousPrerequisite);
      }
    } else if (Array.isArray(token)) {
      currentPrerequisite.o.push(buildPrerequisiteTree(token))
    } else {
      currentPrerequisite.o.push(token);
    }
  }

  // if the logic gate `g` has never been set, then it has never occurred in the parse tree.
  // this should only be possible if there is a single class as the prerequisite meaning there
  // should also only be *one* operand
  if (!logicGateSetOnce) {
    const firstOperand = currentPrerequisite.o[0];
    // if there is more than one operand then there is an error
    if (currentPrerequisite.o.length > 1) {
      throw new Error(oneLine`
        Encountered a ParseTree with more than one operand and no operator (i.e. 'and' or 'or')!
        The parse tree encountered is: '${JSON.stringify(tokens)}'.
      `);
    }
    return firstOperand;
  }

  return currentPrerequisite;
}

/**
 * Given a `Prerequisite` tree, this function will replace all `__SUBJECT-CODE|COURSE-NUMBER__`
 * directives in the operands of the `Prerequisite` with `['SUBJECT-CODE', 'COURSE-NUMBER']`
 * tuples.
 */
export function replaceAllCourseDirectivesInTree(prerequisite: Prerequisite) {
  if (prerequisite === undefined) { return undefined; }
  if (typeof prerequisite === 'string') {
    // test the prerequisite for the `__SUBJECT-CODE|COURSE-NUMBER__` pattern
    if (/__(.*)\|(.*)__/.test(prerequisite)) {
      const match = /__(.*)\|(.*)__/.exec(prerequisite)!;
      return [ // return the tuple if the match is found
        match[1].toUpperCase().trim(),
        match[2].toUpperCase().trim(),
      ] as [string, string];
    }
    // else if the pattern doesn't match, just return the string
    return prerequisite;
  } else if (Array.isArray(prerequisite)) {
    // this case shouldn't ever happen because this is the function that replaces the
    // `__SUBJECT-CODE|COURSE-NUMBER__` pattern with array tuples.
    throw new Error(oneLine`
      Found an array when replacing '__SUBJECT-CODE|COURSE-NUMBER__' patterns from 
      'replaceAllCourseDirectivesInTree'!
    `);  
  }
  const newTree = { g: prerequisite.g, o: [] as Prerequisite[] };

  for (let operand of prerequisite.o) {
    if (operand === undefined) {
      continue;
    }
    if (typeof operand === 'object') {
      newTree.o.push(replaceAllCourseDirectivesInTree(operand));
    } else if (/__(.*)\|(.*)__/.test(operand)) {
      const match = /__(.*)\|(.*)__/.exec(operand)!;
      newTree.o.push([
        match[1].toUpperCase().trim(),
        match[2].toUpperCase().trim(),
      ]);
    } else {
      newTree.o.push(operand);
    }
  }

  return newTree as Prerequisite;
}

export function formatPrerequisite(prerequisite: Prerequisite, depth: number = 0): string {
  if (!prerequisite) {
    return '';
  }
  if (Array.isArray(prerequisite)) {
    return `${prerequisite[0] || ''} ${prerequisite[1] || ''}`
  }
  if (typeof prerequisite === 'string') {
    return prerequisite;
  }
  const logicGate = prerequisite.g;
  const operands = prerequisite.o;

  const joinedOperands = (operands
    .map(operand => /*if*/ typeof operand === 'object'
      ? formatPrerequisite(operand, depth + 1)
      : operand
    )
    .join(' ')
  );

  return `(${/*if*/ logicGate === '&' ? 'and' : 'or'} ${joinedOperands})`;
}

export function parsePrerequisites(bodyHtml: string) {
  const match = /.*prerequisites.*\n?([\s\S]*)/i.exec(bodyHtml);
  if (!match) {
    const emptyPrerequisite: Prerequisite = {
      g: '|',
      o: [],
    };
    return emptyPrerequisite;
  }
  const prerequisiteHtml = match[1];
  const textContent = replacePrerequisiteAnchors(prerequisiteHtml);
  const parseTree = transformParenthesesToTree(textContent);
  const tokens = tokenizeByOperator(parseTree.tree);
  const prefix = buildPrerequisiteTree(tokens);
  const result = replaceAllCourseDirectivesInTree(prefix);
  return result;
}

export function parseCourseDetail(html: string) {
  const document = new JSDOM(html).window.document;
  const body = document.querySelector('.ntdefault');
  if (!body) {
    throw new Error('Body was not found in course detail.');
  }

  const bodyHtml = body.innerHTML;
  const description = parseDescription(bodyHtml);
  const prerequisites = parsePrerequisites(bodyHtml);

  return { description, prerequisites };
}
