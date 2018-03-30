import { expect } from 'chai';
import { fetchSubjects } from '../../src/fetch/catalog-umd/subjects';
import { parseSubjects } from '../../src/parsers/catalog-umd/subjects';
import * as fs from 'fs';
import * as path from 'path';

const catalogSubjectsHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/catalog-subjects.html'))
  .toString();

describe.only('catalog.umd.umich.edu', function() {
  it('should do something', async function() {
    const subjects = parseSubjects(catalogSubjectsHtml);
    expect(subjects).to.not.be.empty;
  });
});
