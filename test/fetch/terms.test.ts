import { expect } from 'chai';

import { fetchTerms } from '../../src/fetch/terms';

describe('fetchTerms', function () {
  it('fetches all terms', async function () {
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
});