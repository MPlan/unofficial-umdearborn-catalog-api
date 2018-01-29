import { expect } from 'chai';

import { fetchTerms } from '../../src/fetch/terms';
import { fetchSubjects } from '../../src/fetch/subjects';
import { fetchCatalogEntries } from '../../src/fetch/catalog-entries';
import { fetchScheduleListings } from '../../src/fetch/schedule-listings';
import { fetchCourseDetail } from '../../src/fetch/course-detail';
import { fetchScheduleDetail } from '../../src/fetch/schedule-detail';

const twentySeconds = 20 * 1000;

require('dotenv').config();

describe('fetch', function () {
  it('terms', async function () {
    this.timeout(twentySeconds);
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
    this.timeout(twentySeconds);
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
  it('catalog entries', async function () {
    this.timeout(twentySeconds);
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_CATALOG_ENTRIES) {
      this.skip();
      return;
    }
    const entries = await fetchCatalogEntries('201820', 'CIS');

    for (const { courseNumber, subjectCode, name, scheduleTypes } of entries) {
      expect(courseNumber).to.be.not.empty;
      expect(subjectCode).to.be.equal('CIS');
      expect(name).to.be.not.empty;
      expect(Array.isArray(scheduleTypes)).to.be.true;
    }
  });
  it('schedule listings', async function () {
    this.timeout(twentySeconds);
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_SCHEDULE_LISTINGS) {
      this.skip();
      return;
    }
    const crns = await fetchScheduleListings('201820', 'CIS', '450', 'L');

    for (const crn of crns) {
      expect(crn).to.not.be.empty;
    }
  });
  it('course detail', async function () {
    this.timeout(twentySeconds);
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_COURSE_DETAIL) {
      this.skip();
      return;
    }

    const courseDetail = await fetchCourseDetail('201820', 'CIS', '3200');

    expect(courseDetail.description).to.be.not.empty;
    if (Array.isArray(courseDetail.prerequisites)) {
      throw new Error('Was not expecting an array for prerequisites!');
    }
    if (typeof courseDetail.prerequisites !== 'object') {
      throw new Error('Expected prerequisites to be an object!');
    }
    expect(courseDetail.prerequisites.o.length).to.be.greaterThan(0);
  });
  it('schedule detail', async function () {
    this.timeout(twentySeconds);
    if (process.env.SKIP_FETCH_TEST_ALL || process.env.SKIP_FETCH_TEST_SCHEDULE_DETAIL) {
      this.skip();
      return;
    }

    const scheduleDetail = await fetchScheduleDetail('201820', '20156');

    expect(scheduleDetail).to.be.not.undefined;
  });
});