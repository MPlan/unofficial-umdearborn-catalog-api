import { expect } from 'chai';
import { fetchSubjects } from '../../src/fetch/catalog-umd/subjects';
import { parseSubjects } from '../../src/parsers/catalog-umd/subjects';
import * as fs from 'fs';
import * as path from 'path';

const catalogSubjectsHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/catalog-subjects.html'))
  .toString();

describe.only('catalog subjects parser', function() {
  it('parses subjects and returns a node and code', async function() {
    const subjects = parseSubjects(catalogSubjectsHtml);
    // console.log(subjects);

    expect(subjects).to.not.be.empty;
    for (const subject of subjects) {
      expect(subject.name).to.not.be.empty;
      expect(subject.code).to.not.be.empty;
    }
  });
});
