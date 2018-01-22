import { expect } from 'chai';
import {
  parseCourseDetail, replacePrerequisiteAnchors, transformParenthesesToTree,
  replaceCourseDirectiveInToken, tokenizeByOperator, buildPrerequisiteTree,
  replaceAllCourseDirectivesInTree,
} from '../../src/parsers/course-detail';
import { oneLine } from 'common-tags';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import { Prerequisite } from '../../src/models/course';
const courseDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/course-detail.html')
).toString();
const emptyCourseDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/empty-course-detail.html')
).toString();

describe(`course detail parser`, function () {
  it(`'parseCourseDetail' with 'description' and 'prerequisites'`, function () {
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
                { g: '|', o: [['CIS', '350'], ['CIS', '3501'], ['IMSE', '350']] }
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

  it(`returns empty when the course detail page is empty`, function () {
    const result = parseCourseDetail(emptyCourseDetailHtml);
    expect(result.description).to.be.undefined;
    expect(result.prerequisites).to.be.undefined;
  });

  it(`replacePrerequisiteAnchors`, function () {
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

  it(`transformParenthesesToTree`, function () {
    const expression = `the quick (brown (fox jumps) over the (lazy dog))`;
    const result = transformParenthesesToTree(expression);
    expect(result.tree).to.be.deep.equal(
      ['the', 'quick', ['brown', ['fox', 'jumps'], 'over', 'the', ['lazy', 'dog']]]
    );
    expect(result.lastIndex).to.be.equal(expression.length);
  });

  it(`replaceCourseDirectiveInToken`, function () {
    const stringWithCourseDirective = 'some stuff __CIS|310__ some other stuff';
    expect(replaceCourseDirectiveInToken(stringWithCourseDirective)).to.be.equal('__CIS|310__');
    const stringWithout = 'blah blah blah';
    expect(replaceCourseDirectiveInToken(stringWithout)).to.be.equal(stringWithout);
  });

  it(`tokenizeByOperator`, function () {
    const expression = ['one', 'two', 'and', ['buckle', 'shoe', 'or', 'three', 'four']];
    const result = tokenizeByOperator(expression);
    expect(result).to.be.deep.equal([
      'one two', 'and', ['buckle shoe', 'or', 'three four']
    ]);
  });

  it(`buildPrerequisiteTree`, function () {
    const expression = ['one two', 'and', ['buckle shoe', 'or', 'three four']];
    const result = buildPrerequisiteTree(expression);
    expect(result).to.be.deep.equal({
      'g': '&',
      'o': [
        'one two',
        { 'g': '|', 'o': ['buckle shoe', 'three four'] }
      ]
    });

    const expressionWithoutOperator = ['the', 'quick', 'or', 'brown', 'fox'];
    const otherResult = buildPrerequisiteTree(expressionWithoutOperator);
    console.log({ otherResult });
  });

  it(`replaceAllCourseDirectivesInTree`, function () {
    const tree: Prerequisite = {
      'g': '&',
      'o': [
        '__ONE|TWO__',
        { 'g': '|', 'o': ['buckle shoe', '__three|four__'] }
      ]
    };
    const expectedResult: Prerequisite = {
      'g': '&',
      'o': [
        ['ONE', 'TWO'],
        { 'g': '|', 'o': ['buckle shoe', ['THREE', 'FOUR']] }
      ]
    };
    expect(replaceAllCourseDirectivesInTree(tree)).to.be.deep.equal(expectedResult);
  });
});
