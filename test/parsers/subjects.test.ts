import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { parseSubjectsSelfService } from '../../src/parsers/selfservice-umd/subjects';
const exampleHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/subjects.html'))
  .toString();

describe(`subjects parser`, function() {
  it(`parses 'subjects.html' correctly`, function() {
    const subjects = parseSubjectsSelfService(exampleHtml);
    expect(subjects.length).to.be.equal(113);

    for (const { code, name } of subjects) {
      expect(code).to.not.be.empty;
      expect(name).to.not.be.empty;
    }
  });
});
