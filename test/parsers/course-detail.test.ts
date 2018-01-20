import { expect } from 'chai';
import { parseCourseDetail, parsePrerequisiteBlock, formatPrerequisite } from '../../src/parsers/course-detail';
import { oneLine } from 'common-tags';
import * as fs from 'fs';
import * as path from 'path';
const courseDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/course-detail.html')
).toString();

describe(`course detail parser`, function () {
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

    const result = parsePrerequisiteBlock(`(A and B and C or D and E)`);
    // (and (or (and A B C) D) E)
    // A + B + C - D ==> (- (+ A B C) D)
    const formatted = formatPrerequisite(result);

    console.log(formatted);

  });
  it(`parses the prerequisites out of the course detail HTML`);
});
