import { expect } from 'chai';
import { parseDescription } from '../src/parsers/course-detail-parser';
import { oneLine } from 'common-tags';
import * as fs from 'fs';
import * as path from 'path';
const rawDescriptionHtml = fs.readFileSync(
  path.resolve(__dirname, './example-pages/description-body.html')
).toString();

describe('Course detail parser', function () {
  it('parses description out of course detail HTML', function () {
    const description = parseDescription(rawDescriptionHtml);
    expect(description).to.be.equal(oneLine`
      This course takes a detailed, hands-on approach to study the procedures and techniques used to
      identify, extract, validate, document and preserve electronic evidence. Students completing
      this course will be familiar with the core computer science theory and practical skills
      necessary to perform basic computer forensic investigations, understand the role of technology
      in investigating computer-based crime, and be prepared to deal with investigative bodies at a
      basic level.
    `);
  });
});