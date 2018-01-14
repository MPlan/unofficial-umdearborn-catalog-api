import { expect } from 'chai';

import { fetchTerms } from '../../src/fetch/terms';
import { fetchSubjects } from '../../src/fetch/subjects';

require('dotenv').config();

describe('fetch', function () {
  it('terms', async function () {
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_TERMS) {
      this.skip();
      return;
    }
    const terms = await fetchTerms();
    const seasons = ['fall', 'winter', 'summer'];
    for (const { code, season, year } of terms) {
      const yearFromKey = parseInt(code.substring(0, 4));
      const seasonFromKey = parseInt(code.substring(4));
      const correctedYear = Math.floor(yearFromKey + (seasonFromKey / 30) - (2 / 3));
      expect(correctedYear).to.be.equal(year);
      const seasonIndex = Math.floor((seasonFromKey - 10) / 30 * 3);
      expect(season).to.be.equal(seasons[seasonIndex]);
    }
  });
  it('subjects', async function () {
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_SUBJECTS) {
      this.skip();
      return;
    }
    const subjects = await fetchSubjects('201820');
    for (const { code, name } of subjects) {
      expect(code).to.be.not.empty;
      expect(name).to.be.not.empty;
    }
  });
});