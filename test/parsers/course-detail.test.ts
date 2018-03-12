import { expect } from 'chai';
import {
  parseCourseDetail,
  replacePrerequisiteAnchors,
  transformParenthesesToTree,
  replaceCourseDirectiveInToken,
  tokenizeByOperator,
  buildPrerequisiteTree,
  replaceAllCourseDirectivesInTree,
  parseRestrictions
} from '../../src/parsers/course-detail';
import { oneLine } from 'common-tags';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import { Prerequisite } from '../../src/parsers/course-detail';
const courseDetailHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/course-detail.html'))
  .toString();
const emptyCourseDetailHtml = fs
  .readFileSync(
    path.resolve(__dirname, '../example-pages/empty-course-detail.html')
  )
  .toString();
const courseDetailOnePrerequisiteHtml = fs
  .readFileSync(
    path.resolve(__dirname, '../example-pages/course-detail-one-prereq.html')
  )
  .toString();
const courseDetailOneCoursePrerequisiteHtml = fs
  .readFileSync(
    path.resolve(
      __dirname,
      '../example-pages/course-detail-one-course-prereq.html'
    )
  )
  .toString();
const courseDetailWithCorequisiteHtml = fs
  .readFileSync(
    path.resolve(
      __dirname,
      '../example-pages/course-detail-with-corequisites.html'
    )
  )
  .toString();
const courseDetailManyRestrictions = fs
  .readFileSync(
    path.resolve(
      __dirname,
      '../example-pages/course-detail-many-restrictions.html'
    )
  )
  .toString();
const courseDetailMath216 = fs
  .readFileSync(
    path.resolve(__dirname, '../example-pages/course-detail-math-216.html')
  )
  .toString();

describe(`course detail parser`, function() {
  it(`parseCourseDetail`, function() {
    const result = parseCourseDetail(courseDetailHtml);
    const expectedPrerequisites = {
      g: '&',
      o: [
        {
          g: '|',
          o: [
            {
              g: '&',
              o: [
                ['CIS', '310'],
                {
                  g: '|',
                  o: [['CIS', '350'], ['CIS', '3501'], ['IMSE', '350']]
                }
              ]
            },
            { g: '&', o: [['ECE', '370'], ['MATH', '276']] },
            { g: '&', o: [['ECE', '370'], ['ECE', '276']] }
          ]
        },
        ['IMSE', '317']
      ]
    };
    expect(result.description).to.be.equal(oneLine`
      Introduction to computer operating systems. Process control, threads, concurrency, memory
      management, virtual memory, uniprocessor, multiprocessor, and real-time scheduling, I/O
      management, disk scheduling, file management, distributed processing, client/server, clusters,
      distributed process management,security. (F,W).
    `);
    expect(result.prerequisites).to.be.deep.equal(expectedPrerequisites);
  });

  it(`'parseCourseDetail' with corequisites`, function() {
    const result = parseCourseDetail(courseDetailWithCorequisiteHtml);
    expect(result.corequisites).to.be.deep.equal(['CIS', '200L']);
  });

  it(`returns empty when the course detail page is empty`, function() {
    const result = parseCourseDetail(emptyCourseDetailHtml);
    expect(result.description).to.be.undefined;
    expect(result.prerequisites).to.be.undefined;
  });

  it(`returns a single string or tuple if there is only one prerequisite`, function() {
    const resultString = parseCourseDetail(courseDetailOnePrerequisiteHtml);
    expect(resultString.prerequisites).to.be.equal('Mathematics Placement 080');
    const resultTuple = parseCourseDetail(
      courseDetailOneCoursePrerequisiteHtml
    );
    expect(resultTuple.prerequisites).to.be.deep.equal(['ACC', '298']);
  });

  it(`replacePrerequisiteAnchors`, function() {
    const prerequisiteHtml = `
      <br /> Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=CIS&amp;sel_subj=&amp;sel_crse_strt=310&amp;sel_crse_end=310&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>CIS 310</a> Minimum Grade of D and (Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=CIS&amp;sel_subj=&amp;sel_crse_strt=350&amp;sel_crse_end=350&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>CIS 350</a> Minimum Grade of D or Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=CIS&amp;sel_subj=&amp;sel_crse_strt=3501&amp;sel_crse_end=3501&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>CIS 3501</a> Minimum Grade of D or Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=IMSE&amp;sel_subj=&amp;sel_crse_strt=350&amp;sel_crse_end=350&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>IMSE 350</a> Minimum Grade of D) or (Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=ECE&amp;sel_subj=&amp;sel_crse_strt=370&amp;sel_crse_end=370&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>ECE 370</a> Minimum Grade of D and Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=MATH&amp;sel_subj=&amp;sel_crse_strt=276&amp;sel_crse_end=276&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>MATH 276</a> Minimum Grade of D) or (Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=ECE&amp;sel_subj=&amp;sel_crse_strt=370&amp;sel_crse_end=370&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>ECE 370</a> Minimum Grade of D and Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=ECE&amp;sel_subj=&amp;sel_crse_strt=276&amp;sel_crse_end=276&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>ECE 276</a> Minimum Grade of D) and Undergraduate level
      <a href='/BANP/bwckctlg.p_display_courses?term_in=201820&amp;one_subj=IMSE&amp;sel_subj=&amp;sel_crse_strt=317&amp;sel_crse_end=317&amp;sel_levl=&amp;sel_schd=&amp;sel_coll=&amp;sel_divs=&amp;sel_dept=&amp;sel_attr='>IMSE 317</a> Minimum Grade of D
      <br />
      <br />
    `;
    const textContent = replacePrerequisiteAnchors(prerequisiteHtml);
    expect(textContent).to.equal(oneLine`
      Undergraduate level __CIS|310__ Minimum Grade of D and (Undergraduate level __CIS|350__
      Minimum Grade of D or Undergraduate level __CIS|3501__ Minimum Grade of D or Undergraduate
      level __IMSE|350__ Minimum Grade of D) or (Undergraduate level __ECE|370__ Minimum Grade of
      D and Undergraduate level __MATH|276__ Minimum Grade of D) or (Undergraduate level __ECE|370__
      Minimum Grade of D and Undergraduate level __ECE|276__ Minimum Grade of D) and Undergraduate
      level __IMSE|317__ Minimum Grade of D
    `);
  });

  it(`transformParenthesesToTree`, function() {
    const expression = `the quick (brown (fox jumps) over the (lazy dog))`;
    const result = transformParenthesesToTree(expression);
    expect(result.tree).to.be.deep.equal([
      'the',
      'quick',
      ['brown', ['fox', 'jumps'], 'over', 'the', ['lazy', 'dog']]
    ]);
    expect(result.lastIndex).to.be.equal(expression.length);
  });

  it(`replaceCourseDirectiveInToken`, function() {
    const stringWithCourseDirective = 'some stuff __CIS|310__ some other stuff';
    expect(
      replaceCourseDirectiveInToken(stringWithCourseDirective)
    ).to.be.equal('__CIS|310__');
    const stringWithout = 'blah blah blah';
    expect(replaceCourseDirectiveInToken(stringWithout)).to.be.equal(
      stringWithout
    );
  });

  it(`tokenizeByOperator`, function() {
    const expression = [
      'one',
      'two',
      'and',
      ['buckle', 'shoe', 'or', 'three', 'four']
    ];
    const result = tokenizeByOperator(expression);
    expect(result).to.be.deep.equal([
      'one two',
      'and',
      ['buckle shoe', 'or', 'three four']
    ]);
  });

  it(`buildPrerequisiteTree`, function() {
    const expression = ['one two', 'and', ['buckle shoe', 'or', 'three four']];
    const result = buildPrerequisiteTree(expression);
    expect(result).to.be.deep.equal({
      g: '&',
      o: ['one two', { g: '|', o: ['buckle shoe', 'three four'] }]
    });
  });

  it(`replaceAllCourseDirectivesInTree`, function() {
    const tree: Prerequisite = {
      g: '&',
      o: ['__ONE|TWO__', { g: '|', o: ['buckle shoe', '__three|four__'] }]
    };
    const expectedResult: Prerequisite = {
      g: '&',
      o: [['ONE', 'TWO'], { g: '|', o: ['buckle shoe', ['THREE', 'FOUR']] }]
    };
    expect(replaceAllCourseDirectivesInTree(tree)).to.be.deep.equal(
      expectedResult
    );
  });

  it(`parseRestrictions`, function() {
    const document = new JSDOM(courseDetailManyRestrictions).window.document;

    const body = document.querySelector('.ntdefault');
    if (!body) {
      throw new Error('Body was not found in course detail.');
    }

    const bodyTextContent = body.textContent || '';

    expect(parseRestrictions(bodyTextContent)).to.be.equal(oneLine`
      Must be enrolled in one of the following Levels: Doctorate Rackham Graduate Rackham Doctorate
      Graduate Must be enrolled in one of the following Colleges: Coll of Engineering & Comp Sci
    `);
  });

  it(`parseCreditHours`, function() {
    const creditHourRange = parseCourseDetail(courseDetailHtml);

    expect(creditHourRange.creditHours).to.be.equal(4);
    expect(creditHourRange.creditHoursMin).to.be.equal(3);

    const singleCreditHours = parseCourseDetail(
      courseDetailOnePrerequisiteHtml
    );

    expect(singleCreditHours.creditHours).to.be.equal(3);
    expect(singleCreditHours.creditHoursMin).to.be.equal(3);
  });

  it(`parses MATH 216 (edge case)`, () => {
    const resultMath216 = parseCourseDetail(courseDetailMath216);
    expect(resultMath216.prerequisites).to.have.same.members(['MATH', '116']);
  });

  it(`course truth table`, function() {
    function and(...args: boolean[]) {
      return args.reduce((final, next) => final && next);
    }

    function or(...args: boolean[]) {
      return args.reduce((final, next) => final || next);
    }

    function fromPage(
      cis310: boolean,
      cis350: boolean,
      cis3501: boolean,
      imse350: boolean,
      ece370a: boolean,
      math276: boolean,
      ece370b: boolean,
      ece276: boolean,
      imse317: boolean
    ) {
      return (
        (cis310 && (cis350 || cis3501 || imse350)) ||
        (ece370a && math276) ||
        (ece370b && ece276 && imse317)
      );
    }

    function fromParser(
      cis310: boolean,
      cis350: boolean,
      cis3501: boolean,
      imse350: boolean,
      ece370a: boolean,
      math276: boolean,
      ece370b: boolean,
      ece276: boolean,
      imse317: boolean
    ) {
      // return or(
      //   or(
      //     and(cis310, or(cis350, cis3501, imse350,)),
      //     and(ece370a, math276),
      //   ),
      //   and(
      //     and(ece370b, ece276),
      //     imse317,
      //   ),
      // );
      return or(
        and(cis310, or(cis350, cis3501, imse350)),
        and(ece370a, math276),
        and(ece370b, ece276, imse317)
      );
    }

    function toBooleans(x: number) {
      const binaryString = x.toString(2);
      let newX = '';
      for (let i = 0; i < 9 - binaryString.length; i += 1) {
        newX += '0';
      }
      newX += binaryString;

      const booleans = newX.split('').map(x => (x === '1' ? true : false));
      return booleans;
    }

    for (let i = 0; i < Math.pow(2, 9); i += 1) {
      const booleans = toBooleans(i);

      expect(booleans.length).to.be.equal(9);

      const cis310 = booleans[0];
      const cis350 = booleans[1];
      const cis3501 = booleans[2];
      const imse350 = booleans[3];
      const ece370a = booleans[4];
      const math276 = booleans[5];
      const ece370b = booleans[6];
      const ece276 = booleans[7];
      const imse317 = booleans[8];

      const resultFromParser = fromParser(
        cis310,
        cis350,
        cis3501,
        imse350,
        ece370a,
        math276,
        ece370b,
        ece276,
        imse317
      );

      const resultFromPage = fromPage(
        cis310,
        cis350,
        cis3501,
        imse350,
        ece370a,
        math276,
        ece370b,
        ece276,
        imse317
      );

      expect(resultFromParser).to.be.equal(resultFromPage);
    }
  });
});
