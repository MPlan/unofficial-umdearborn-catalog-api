import { JSDOM } from 'jsdom';
import { Prerequisite } from '../models/course';

interface CourseDetailResult {
  description: string,
  prerequisites: Prerequisite,
}

export function parseCourseDetail(html: string) {
  const document = new JSDOM(html).window.document;

  const body = document.querySelector('.ntdefault');
  if (!body) {
    throw new Error('Body was not found in course detail.');
  }
  const bodyHtml = body.innerHTML;
  bodyHtml
}
