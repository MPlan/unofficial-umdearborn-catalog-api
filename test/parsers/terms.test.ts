import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { parseTerms } from '../../src/parsers/selfservice-umd/terms';
const exampleHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/terms.html'))
  .toString();
const seasons = ['fall', 'winter', 'summer'];

describe(`terms parser`, function() {
  it(`parses 'terms.html' correctly`, function() {
    const terms = parseTerms(exampleHtml);
    expect(terms.length).to.be.equal(62);

    for (const { code, season, year } of terms) {
      const yearFromKey = parseInt(code.substring(0, 4));
      const seasonFromKey = parseInt(code.substring(4));
      const correctedYear = Math.floor(
        yearFromKey + seasonFromKey / 30 - 2 / 3
      );
      expect(correctedYear).to.be.equal(year);
      const seasonIndex = Math.floor((seasonFromKey - 10) / 30 * 3);
      expect(season).to.be.equal(seasons[seasonIndex]);
    }
  });
});
