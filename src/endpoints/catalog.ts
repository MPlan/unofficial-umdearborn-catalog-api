import * as express from 'express';
import * as Http from 'http-status-codes';
export const catalog = express.Router();
import { fetchTerms } from '../fetch/terms';
import { fetchSubjects } from '../fetch/subjects';
import { fetchCatalogEntries } from '../fetch/catalog-entries';
import { fetchCourseDetail } from '../fetch/course-detail';
import { fetchScheduleListings } from '../fetch/schedule-listings';
import { fetchScheduleDetail } from '../fetch/schedule-detail';

catalog.get('/terms', async (req, res) => {
  const terms = await fetchTerms();
  res.json(terms);
});

catalog.get('/subjects/:termCode', async (req, res) => {
  const termCode = req.params.termCode as string | undefined;
  if (!termCode) {
    res.sendStatus(Http.NOT_FOUND);
    return;
  }
  const subjects = await fetchSubjects(termCode);
  res.json(subjects);
});

catalog.get('/entries/:termCode/:subjectCode', async (req, res) => {
  const termCode = req.params.termCode as string | undefined;
  const subjectCode = req.params.subjectCode as string | undefined;
  if (!termCode || !subjectCode) {
    res.sendStatus(Http.NOT_FOUND);
    return;
  }
  const entries = await fetchCatalogEntries(termCode, subjectCode);
  res.json(entries);
});

catalog.get('/course-details/:termCode/:subjectCode/:courseNumber', async (req, res) => {
  const termCode = req.params.termCode as string | undefined;
  const subjectCode = req.params.subjectCode as string | undefined;
  const courseNumber = req.params.courseNumber as string | undefined;
  if (!termCode || !subjectCode || !courseNumber) {
    res.sendStatus(Http.NOT_FOUND);
    return;
  }
  const courseDetail = await fetchCourseDetail(termCode, subjectCode, courseNumber);
  res.json({ termCode, subjectCode, courseNumber, ...courseDetail });
});

catalog.get(
  '/schedule-listings/:termCode/:subjectCode/:courseNumber/:scheduleTypeCode',
  async (req, res) => {
    const termCode = req.params.termCode as string | undefined;
    const subjectCode = req.params.subjectCode as string | undefined;
    const courseNumber = req.params.courseNumber as string | undefined;
    const scheduleTypeCode = req.params.scheduleTypeCode as string | undefined;
    if (!termCode || !subjectCode || !courseNumber || !scheduleTypeCode) {
      res.sendStatus(Http.NOT_FOUND);
      return;
    }
    const scheduleListings = await fetchScheduleListings(
      termCode, subjectCode, courseNumber, scheduleTypeCode
    );
    res.json(scheduleListings);
  }
);

catalog.get(
  '/schedule-detail/:termCode/:crn',
  async (req, res) => {
    const termCode = req.params.termCode as string | undefined;
    const crn = req.params.crn as string | undefined;
    if (!termCode || !crn) {
      res.sendStatus(Http.NOT_FOUND);
      return;
    }
    const scheduleDetail = await fetchScheduleDetail(
      termCode, crn
    );
    if (!scheduleDetail) {
      res.sendStatus(Http.NOT_FOUND);
      return;
    }
    res.json(scheduleDetail);
  }
);
