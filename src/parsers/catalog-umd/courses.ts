import { JSDOM } from 'jsdom';

export function parseCourses(html: string) {
  const document = new JSDOM(html).window.document;

  return html;
}

