import { JSDOM } from 'jsdom';

export type Prerequisite =
  | undefined
  // boolean is can be taken concurrently
  // e.g. prerequisites for CIS 150 include MATH 115 as previous or concurrent
  // making: ['MATH', '115', true]
  | [string, string, boolean]
  | string
  | {
      /** the logic gate to use */
      g: '&' | '|';
      /**
       * the operands of the logic gate
       *
       * can be:
       *
       * * another `Prerequisite`
       * * a tuple of `[subjectCode, courseNumber]` e.g. `["CIS", "310"]`
       * * or a simple string e.g. `"Remedial Math"`
       */
      o: Prerequisite[];
    };

interface Course {
  name: string;
  subjectCode: string;
  courseNumber: string;
  description: string;
  creditHoursMin: number;
  creditHoursMax: number;
  restrictions: string[];
  prerequisites: Prerequisite;
  corequisites: Prerequisite;
}

export function parseCourses(html: string) {
  const document = new JSDOM(html).window.document;

  return html;
}
