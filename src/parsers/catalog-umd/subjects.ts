import { JSDOM } from 'jsdom';

export type SubjectResult = {
  code: string;
  name: string;
};

export function parseSubjects(html: string): SubjectResult[] {
  const document = new JSDOM(html).window.document;

  const atozElement = document.querySelector('#atozindex');

  if (!atozElement) return [];
  const unorderedLists = Array.from(atozElement.querySelectorAll('ul'));

  const anchors: HTMLAnchorElement[] = [];
  for (const unorderedList of unorderedLists) {
    const innerAnchors = Array.from(unorderedList.querySelectorAll('a'));
    for (const innerAnchor of innerAnchors) {
      anchors.push(innerAnchor);
    }
  }

  const subjectResults: SubjectResult[] = [];
  for (const anchor of anchors) {
    const anchorInnerText = anchor.textContent;
    if (!anchorInnerText) continue;
    const nameMatch = /(.*) \((\w*)\)/.exec(anchorInnerText);
    if (!nameMatch) continue;
    const subjectName = nameMatch[1];
    const subjectCode = nameMatch[2];

    const obj = { code: subjectCode, name: subjectName };
    subjectResults.push(obj);
  }

  return subjectResults;
}
