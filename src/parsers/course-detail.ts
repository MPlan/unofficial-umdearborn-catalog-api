import { JSDOM } from 'jsdom';
import { Prerequisite } from '../models/course';
import { decode } from 'he';
import { oneLine } from 'common-tags';

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

export function parsePrerequisiteBlock(block: string) {
  // finds inner most `()`
  const match = /\(([^()]*)\)/.exec(block);
  if (!match) {
    throw new Error('no match');
  }
  const innerMost = match[1];

  const tokens = innerMost.split(' ').map(x => x.trim()).filter(x => /* removes empty strings */ x);

  let currentPrerequisite: _Prerequisite = {
    g: undefined,
    o: []
  };

  for (const token of tokens) {
    if (/and/i.test(token) || /or/i.test(token)) {
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

export function parsePrerequisites(bodyHtml: string) {
  const match = /prerequisites([\s\S]*)/i.exec(bodyHtml);
  if (!match) {
    throw new Error(`Could not find prerequisite block in body of course detail html!`);
  }
  const prerequisiteHtml = match[1];
  return { g: '|', o: [] } as Prerequisite;
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

  const result: CourseDetailResult = { description, prerequisites };
  return result;
}
