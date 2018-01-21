import { JSDOM } from 'jsdom';
import { Prerequisite } from '../models/course';
import { decode } from 'he';
import { oneLine } from 'common-tags';
import { formDecode } from '../utilities';

interface CourseDetailResult {
  description: string,
  prerequisites: Prerequisite,
}

export function parseDescription(bodyHtml: string) {
  /** grabs the top of the course detail which includes the description and the types of hours */
  const firstMatch = /([\s\S]*)<br.*\/?>.*hour/.exec(bodyHtml);
  if (!firstMatch) {
    throw new Error(`Could not find description in course detail HTML! Match failed.`);
  }
  // the first capturing group
  const firstPass = firstMatch[1];
  // tries to remove any extra lines in that includes `<br /> 3.000 OR 4.000 Credit hours`
  const secondMatch = firstPass.search(/<br.*\/?>.*hour/);
  const descriptionHtmlEncoded = (/*if*/ secondMatch === -1
    ? firstPass
    : firstPass.substring(0, secondMatch)
  );

  const arr = [decode(descriptionHtmlEncoded).trim()];
  return oneLine(Object.assign(arr, { raw: arr }));
}

interface _Prerequisite {
  g: '&' | '|' | undefined,
  o: Array<string | _Prerequisite>,
}

interface ParseTree extends Array<string | ParseTree> {
  [key: number]: string | ParseTree,
}

interface TokenizedParenthesesResult { tree: ParseTree, lastIndex: number }

/**
 * A simple recursive function that transforms this:
 * 
 * ```txt
 * A B (NESTED_A (NESTED_NESTED) NESTED_B)
 * ```
 * 
 * into a javascript array:
 * 
 * ```
 * [
 *   A,
 *   B,
 *   [
 *     NESTED_A
 *     [NESTED_NESTED]
 *     NESTED_B
 *   ]
 * ]
 * ```
 * 
 * This function removes the parentheses and puts words separated by spaces into nested arrays
 */
export function tokenizeParentheses(expression: string): TokenizedParenthesesResult {
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
      const subExpressionResult = tokenizeParentheses(expression.substring(i + 1));
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

export function replaceCourseDirectiveInToken(token: string) {
  const match = /__(.*)\|(.*)__/.exec(token);
  if (!match) {
    return token;
  }
  const subjectCode = match[1];
  const courseNumber = match[2];

  return `__${subjectCode}|${courseNumber}__`;
}

export function replaceAllCourseDirectives(prerequisite: _Prerequisite) {
  const newTree = { g: prerequisite.g, o: [] } as Prerequisite;

  for (let operand of prerequisite.o) {
    if (typeof operand === 'object') {
      newTree.o.push(replaceAllCourseDirectives(operand));
    } else if (/__(.*)\|(.*)__/.test(operand)) {
      const match = /__(.*)\|(.*)__/.exec(operand)!;
      newTree.o.push([match[1], match[2]]);
    } else {
      newTree.o.push(operand);
    }
  }

  return newTree;
}

export function parsePrerequisiteTokens(tokens: ParseTree) {
  let currentPrerequisite: _Prerequisite = {
    g: undefined,
    o: []
  };

  for (const token of tokens) {
    if (token === 'and' || token === 'or') {
      const gate = /*if*/ token === 'and' ? '&' : '|';
      if (gate === currentPrerequisite.g) {
        continue;
      } else if (currentPrerequisite.g === undefined) {
        currentPrerequisite.g = gate;
      } else {
        let previousPrerequisite = currentPrerequisite;
        currentPrerequisite = {
          g: gate,
          o: [],
        };
        currentPrerequisite.o.push(previousPrerequisite);
      }
    } else if (Array.isArray(token)) {
      currentPrerequisite.o.push(parsePrerequisiteTokens(token))
    } else {
      currentPrerequisite.o.push(token);
    }
  }
  return currentPrerequisite;
}

export function formatPrerequisite(prerequisite: _Prerequisite, depth: number = 0): string {
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

  return document.body.textContent || '';
}

export function tokenizeArray(tree: ParseTree): ParseTree {
  const newTree = [] as ParseTree;
  let currentToken = '';
  for (const node of tree) {
    if (Array.isArray(node)) {
      newTree.push(tokenizeArray(node))
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

export function parsePrerequisites(bodyHtml: string) {
  const match = /.*prerequisites.*\n?([\s\S]*)/i.exec(bodyHtml);
  if (!match) {
    return {
      g: '|',
      o: [],
    }
  }
  const prerequisiteHtml = match[1];
  const arr = [replacePrerequisiteAnchors(prerequisiteHtml)];
  const textContent = oneLine(Object.assign(arr, { raw: arr }));
  const tokenizedParentheses = tokenizeParentheses(textContent);
  const tokens = tokenizeArray(tokenizedParentheses.tree);
  const prefix = parsePrerequisiteTokens(tokens);
  const result = replaceAllCourseDirectives(prefix);
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

  const result = { description, prerequisites };
  return result;
}
