
/**
 * represents a course in the system and its prerequisites.
 */
interface Course {
  /**
   * The subject code that precedes the course number e.g. `CIS` in `CIS 200`. 
   */
  subjectCode: string,
  /**
   * The number of the course that proceeds the subject code e.g. `200` in `CIS 200`.
   */
  courseNumber: string,
  /**
   * The full title of the course as presented in the catalog
   */
  title: string,
  /**
   * The full description of the course as presented in the catalog
   */
  description: string,
  /**
   * The number of credit hours the course has as given in the catalog
   */
  creditHours: number,
  /**
   * A dictionary (aka map) of other hours besides credit hours with the number of hours as the key
   * as presented in the UMConnect catalog.
   * 
   * e.g.
   * 
   * The catalog lists the following hours for `CHEM 134L`:
   * 
   * ```
   * 0.000 Credit hours 
   * 3.000 Lab hours 
   * 1.000 Other hours 
   * ```
   * 
   * All courses are required to list credit hours so that is parsed separately. The other types of
   * hours will be saved in a dictionary/map with the key being the word that precedes `hours` and
   * the value being the number of hours parsed as a string.
   * 
   * ```json
   * {
   *   "Lab": 3,
   *   "Other": 1
   * }
   * ```
   */
  otherHours: { [type: string]: number },
  /**
   * The level(s) of enrollment the course is offered in. Possible values include (but are not
   * limited to):
   * 
   * * Doctorate
   * * Graduate
   * * Rackham
   * * Specialist
   * * Undergraduate
   */
  level: string[],
  /**
   * The types of schedules this course offers. Possible values include (but are not limited to):
   * 
   * * Lecture
   * * Internet
   * * Recitation,
   * * Laboratory
   */
  scheduleTypes: string[],
  /**
   * A `Rule` that defines the prerequisites for this course. The `Rule` interface is generic and
   * allows sub rules. Please see the `Rule` interface for more details.
   */
  prerequisites: Rule<{ subject: string, number: number }>,
  /**
   * Restrictions enforced on the course are presented here. The structure of this field is TBD.
   */
  restrictions: any;
  /**
   * The department of the course. e.g. "Natural Sciences Department "
   */
  department: string,
  /**
   * the course attributes as exactly given in the UMConnect catalog page
   */
  courseAttributes: string[],
  // /**
  //  * all the current and previous sections that this course had
  //  */
  // sections: Section[]
}


/**
 * represents a degree program or a subdegree program. e.g. Software Engineering or Dearborn
 * Discovery Core
 */
interface Program {
  /**
   * a unique ID of the program
   */
  programId: string,
  /**
   * the rules to satisfy this program
   */
  rule: Rule<{ programId: string } | { subject: string, number: number }>,
  /**
   * the name of this program
   */
  name: string,
  /**
   * the year this program has been released
   */
  year: string,
  /**
   * the levels that the program are offered in
   */
  levels: string[]
}

/**
 * represents a rule with two support operators: `and` and `or`. The operands of rules are generic
 * and can be of the generic type `T` or another rule.
 */
interface Rule<T> {
  /**
   * the only two operators that we're currently supporting is `and` and `or`
   */
  operator: 'and' | 'or',
  /**
   * the operands of a rule can be another rule or of a generic type
   */
  operand: (T | Rule<T>)[]
}

/**
 * represents a student in the system
 */
interface Student {
  /**
   * the university given 8 digit student id
   */
  studentId: number,
  /**
   * the full name of the student
   */
  name: string,
  /**
   * a nickname (which will most likely be the first name) for the student
   */
  nick: string,
  /**
   * the levels of the programs the student is enrolled in
   */
  levels: string[]
  /**
   * the IDs of the degree programs the student is enrolled in
   */
  programsIds: string[],
}

/**
 * represents a section of a course offered in the catalog.
 */
interface Section {
  /**
   * the subject code of the course this section is of
   */
  subjectCode: string,
  /**
   * the course number of the course this section is of
   */
  courseNumber: string,
  /**
   * the corresponding id of the semester this section belongs to. This follows the `201610`
   * `201620` academic year semester scheme
   */
  semesterId: string,
  /**
   * the instructor of the section
   */
  instructor: string,
  /**
   * the CRN of the section
   */
  courseRegistrationNumber: string,
  /**
   * tentative field which will include the meeting times of this section
   */
  meetingTimes: any,
  /**
   * If the section is filled (or has been filled), this will be true. This flag may be used with a
   * warning to the user. If previous sections of the course have all been filled, then the
   * application may warn the user that might not be able to register for it.
   */
  courseFilled: boolean
}

/**
 * represents a semester
 */
interface Semester {
  /**
   * the id of the semester
   */
  semesterId: string,
  /**
   * the academic year of the semester, which is different from the actual year
   */
  academicYearCode: number,
  /**
   * the calendar year of the semester
   */
  calendarYear: number,
  /**
   * the season the semester is labeled with.
   */
  season: 'fall' | 'winter' | 'summer',
  /**
   * tentative field to Summer term I or term II
   */
  term: string,
}

/**
 * represents a choice of courses within a semester.
 */
interface PlanSemester {
  /**
   * the id of the semester this plan semester belongs to
   */
  semesterId: string,
  /**
   * the id of the plan this PlanSemester belongs to
   */
  planId: string,
  /**
   * the list of chosen courses
   */
  courses: Course[]
}

/**
 * represents a student's desired MPlan in the form of a plan
 */
interface Plan {
  /**
   * the ID of this plan
   */
  planId: string,
  /**
   * the id of the user this plan belongs to
   */
  userId: string,
  /**
   * a list of the `PlanSemester` entity above
   */
  planSemesters: PlanSemester[]
}


    interface SomeName {
      // bunch of text0
    }

    interface SomeOtherName {
      // bunch of text1
    }