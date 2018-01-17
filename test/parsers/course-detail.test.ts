import { expect } from 'chai';
import { parseCourseDetail } from '../../src/parsers/course-detail';
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
  it(`parses the prerequisites out of the course detail HTML`);
});
