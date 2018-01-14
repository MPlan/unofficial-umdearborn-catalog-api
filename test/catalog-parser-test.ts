import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { parseCatalogEntriesHtml, parseHeader } from '../src/parsers/catalog-parser';
const exampleHtml = fs.readFileSync(
  path.resolve(__dirname, './example-pages/course-list.html')
).toString();

describe('Catalog entries parser', function () {
  const subjectCode = 'SUB';
  const courseNumber = '100L';
  const title = 'some course title - with -- extra _ dashes';
  const header = `${subjectCode} ${courseNumber} - ${title}`;
  it(`parses headers correctly: "${header}"`, function () {
    const parsedHeader = parseHeader(header);
    expect(parsedHeader.subjectCode).to.be.equal(subjectCode);
    expect(parsedHeader.courseNumber).to.be.equal(courseNumber);
    expect(parsedHeader.title).to.be.equal(title);
  });

  it('parses "course-list.html" correctly', function () {
    const catalogEntries = parseCatalogEntriesHtml(exampleHtml);
    expect(catalogEntries.length).to.be.equal(136);

    for (const { subjectCode, courseNumber, title, href } of catalogEntries) {
      expect(subjectCode).to.be.equal('CIS');
      expect(courseNumber).to.not.be.empty;
      expect(title).to.not.be.empty;
      expect(href).to.not.be.empty;
    }
  });
});