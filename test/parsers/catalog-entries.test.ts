import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {
  parseCatalogEntries,
  parseHeader
} from '../../src/parsers/selfservice-umd/catalog-entries';
const exampleHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/course-list.html'))
  .toString();

describe('catalog entries parser', function() {
  const subjectCode = 'SUB';
  const courseNumber = '100L';
  const title = 'some course title - with -- extra _ dashes';
  const header = `${subjectCode} ${courseNumber} - ${title}`;
  it(`parses headers correctly: '${header}'`, function() {
    const parsedHeader = parseHeader(header);
    expect(parsedHeader.subjectCode).to.be.equal(subjectCode);
    expect(parsedHeader.courseNumber).to.be.equal(courseNumber);
    expect(parsedHeader.title).to.be.equal(title);
  });

  it(`parses 'course-list.html' correctly`, function() {
    const catalogEntries = parseCatalogEntries(exampleHtml);
    expect(catalogEntries.length).to.be.equal(136);

    for (const {
      subjectCode,
      courseNumber,
      name,
      scheduleTypes
    } of catalogEntries) {
      expect(subjectCode).to.be.equal('CIS');
      expect(courseNumber).to.not.be.empty;
      expect(name).to.not.be.empty;
      expect(Array.isArray(scheduleTypes)).to.be.true;
    }
  });
});
