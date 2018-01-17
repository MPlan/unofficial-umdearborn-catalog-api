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

export function parsePrerequisites(bodyHtml: string) {
  // TODO
  // const match = /prerequisites([\s\S]*)/i.exec(bodyHtml);
  // if (!match) {
  //   throw new Error(`Could not find prerequisite block in body of course detail html!`);
  // }
  // const prerequisiteHtml = match[1];
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
