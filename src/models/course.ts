export type Prerequisite = undefined | [string, string] | string | {
  /** the logic gate to use */
  g: '&' | '|',
  /**
   * the operands of the logic gate
   * 
   * can be:
   * 
   * * another `Prerequisite`
   * * a tuple of `[subjectCode, courseNumber]` e.g. `["CIS", "310"]`
   * * or a simple string e.g. `"Remedial Math"`
   */
  o: Prerequisite[],
}

export interface Section {
  /** the course registration number */
  crn: string,
  /** unique name of the instructor */
  ins: string[],
  /** schedule type of this section e.g. Lecture or Internet */
  typ: string[],
  /** time of day of this schedule */
  tim: string[],
  /** the days this schedule was offered on e.g. TR for Tuesday Thursdays */
  day: string[],
  /** the location of this section as it appears on the SIS */
  loc: string[],
  /** the total capacity *including* cross-listed seats */
  cap: number,
  /** the remaining seats *including* cross-listed seats */
  rem: number,
}

export interface Course {
  /** the subject code of this course. e.g. `CIS` */
  subjectCode: string,
  /** the course number of this course. e.g. `450` */
  courseNumber: string,
  /** the full name of the course */
  name: string,
  /** the description of the course */
  description: string,
  /**
   * the number of credit hours of the course determined by the most recent sections in the most
   * recent terms of this course
   */
  credits: number,
  /**
   * a credit range is possible if the `creditsMin` is present. `credits` then becomes a credit max/
   */
  creditsMin: number | undefined,
  /** the restriction placed on this course */
  restrictions: Array<any>,
  /** represents the set of courses needed to have been taken before the course */
  prerequisites: Prerequisite,
  /** represents the set of courses needed to be taken either before or during the course */
  corequisites: Prerequisite,
  /** tuples of courses that this course is cross listed with */
  crossList: Array<[string, string]>,
  /** a record of sections in the last three years */
  sections: { [sectionCode: string]: Array<Section> },
}
