import { expect } from 'chai';
import {
  parseCourseDetail, parsePrerequisiteTokens, formatPrerequisite, tokenizeParentheses,
  parsePrerequisites, tokenizeArray
} from '../../src/parsers/course-detail';
import { oneLine } from 'common-tags';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
const courseDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/course-detail.html')
).toString();

describe(`course detail parser`, function () {
  it(`works`, function () {
    const result = parseCourseDetail(courseDetailHtml);
    console.log(result.prerequisites);
  });
  it(`parses description out of course detail HTML`, function () {
    const courseDetail = parseCourseDetail(courseDetailHtml);
    expect(courseDetail.description).to.be.equal(oneLine`
      Introduction to computer operating systems. Process control, threads, concurrency, memory
      management, virtual memory, uniprocessor, multiprocessor, and real-time scheduling, I/O
      management, disk scheduling, file management, distributed processing, client/server, clusters,
      distributed process management, security. (F,W).
    `);
  });
  it(`parses prerequisite blocks correctly`, function () {
    const block = oneLine`(
      CIS_310
      and (CIS_350 or CIS_3501 or IMSE_350)
      or (ECE_370 and MATH_276)
      or (ECE_370 and ECE_276)
      and IMSE_317 
    )`;

    // const result = parsePrerequisiteBlock(block);

    // const result = parsePrerequisiteTokens(`(A and B and C or D and E)`);
    // // (and (or (and A B C) D) E)
    // // A + B + C - D ==> (- (+ A B C) D)
    // const formatted = formatPrerequisite(result);

    // console.log(formatted);

  });
  it(`tokenizeParentheses`, function () {
    const expression = `A B C (NESTED_A (super nested) NESTED_B NESTED_C)`;
    const result = tokenizeParentheses(expression);
    expect(result.lastIndex).to.be.equal(expression.length);
    expect(result.tree).to.be.deep.equal([
      'A',
      'B',
      'C',
      [
        'NESTED_A',
        ['super', 'nested'],
        'NESTED_B',
        'NESTED_C',
      ]
    ]);
  });
  it(`parses the prerequisites out of the course detail HTML`, function () {
    const document = new JSDOM(courseDetailHtml).window.document;

    const body = document.querySelector('.ntdefault');
    if (!body) {
      throw new Error('no body found in course detail html');
    }

    const bodyHtml = body.innerHTML;
    const prerequisites = parsePrerequisites(bodyHtml);

    // console.log(prerequisites);
  });
  it(`replacePrerequisiteAnchors`);
  it(`tokenizeArray`, function () {
    const tree = [
      'Undergraduate',
      'level',
      '__CIS|310__',
      'Minimum',
      'Grade',
      'of',
      'D',
      'and',
      ['Undergraduate',
        'level',
        '__CIS|350__',
        'Minimum',
        'Grade',
        'of',
        'D',
        'or',
        'Undergraduate',
        'level',
        '__CIS|3501__',
        'Minimum',
        'Grade',
        'of',
        'D',
        'or',
        'Undergraduate',
        'level',
        '__IMSE|350__',
        'Minimum',
        'Grade',
        'of',
        'D'],
      'or',
      ['Undergraduate',
        'level',
        '__ECE|370__',
        'Minimum',
        'Grade',
        'of',
        'D',
        'and',
        'Undergraduate',
        'level',
        '__MATH|276__',
        'Minimum',
        'Grade',
        'of',
        'D'],
      'or',
      ['Undergraduate',
        'level',
        '__ECE|370__',
        'Minimum',
        'Grade',
        'of',
        'D',
        'and',
        'Undergraduate',
        'level',
        '__ECE|276__',
        'Minimum',
        'Grade',
        'of',
        'D'],
      'and',
      'Undergraduate',
      'level',
      '__IMSE|317__',
      'Minimum',
      'Grade',
      'of',
      'D'
    ];

    const newTree = tokenizeArray(tree);

    const result = parsePrerequisiteTokens(newTree);

    console.log(formatPrerequisite(result));
  });
});
