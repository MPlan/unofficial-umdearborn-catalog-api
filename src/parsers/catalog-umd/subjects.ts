import { JSDOM } from 'jsdom';

export type SubjectResult = {
  code: string;
  name: string;
};

export function parseSubjects(html: string): SubjectResult[] {
  const document = new JSDOM(html).window.document;
  
  // document.querySelector();

  return [];
}
