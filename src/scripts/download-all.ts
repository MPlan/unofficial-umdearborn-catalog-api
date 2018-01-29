import * as fs from 'fs';

import { fetchSubjects } from '../fetch/subjects';
import { fetchCatalogEntries } from '../fetch/catalog-entries';
import { fetchCourseDetail } from '../fetch/course-detail';
import { fetchScheduleListings } from '../fetch/schedule-listings';
import { fetchScheduleDetail } from '../fetch/schedule-detail';
import { Course, Section } from '../models/course';

function writeFile(path: string, data: Buffer | string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) { reject(err); }
      else { resolve(); }
    });
  })
}

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
}

async function main() {
  const termCode = '201820';

  const subjects = (await fetchSubjects(termCode)).map(a => a.code);

  const coursesBySubjects: {
    subjectCode: string;
    courses: Course[];
  }[] = [];

  for (const subjectCode of subjects) {
    try {
      console.log(`
  ============================================================
  Fetching entries for '${subjectCode}' during ${termCode}...
  ============================================================
`);

      const entries = await fetchCatalogEntries(termCode, subjectCode);
      console.log(`Got ${entries.length} entries!`);

      const courses: Course[] = [];

      for (const { name, courseNumber, scheduleTypes } of entries) {
        try {

          console.log(`Fetching course details for ${subjectCode} ${courseNumber}...`);
          const { corequisites, description, prerequisites } = await fetchCourseDetail(
            termCode, subjectCode, courseNumber
          );
          console.log(`Fetching schedules details for ${subjectCode} ${courseNumber}...`);

          const partialSections: {
            ins: string[];
            typ: string[];
            tim: string[];
            day: string[];
            loc: string[];
            crn: string;
          }[] = [];

          for (const scheduleType of scheduleTypes) {
            try {
              const scheduleListings = await fetchScheduleListings(
                termCode, subjectCode, courseNumber, scheduleType
              );
              for (const scheduleListing of scheduleListings) {
                partialSections.push(scheduleListing);
              }
            } catch (e) {
              console.warn(e);
              continue;
            }
          }

          const sectionList: Section[] = [];


          for (const section of partialSections) {
            try {
              const capRem = await fetchScheduleDetail(termCode, section.crn);
              const s: Section = {
                cap: capRem && capRem.cap || NaN,
                rem: capRem && capRem.rem || NaN,
                ...section
              };
              sectionList.push(s);
            } catch (e) {
              console.warn(e);
              continue;
            }
          }
          console.log(`Finished fetching schedules details for ${subjectCode} ${courseNumber}!`)

          const sections = sectionList.reduce((obj, section) => {
            const arr = obj[termCode] || [];
            arr.push(section);
            obj[termCode] = arr;
            return obj;
          }, {} as { [termCode: string]: Section[] })

          const course: Course = {
            name,
            corequisites,
            courseNumber,
            credits: 0,
            creditsMin: undefined,
            crossList: [],
            description: description || '',
            prerequisites,
            restrictions: [],
            sections,
            subjectCode,
          };
          courses.push(course);

        } catch (e) {
          console.warn(e);
          continue;
        }
      }
      coursesBySubjects.push({ subjectCode, courses });

    } catch (e) {
      console.warn(e);
      continue;
    }
  }


  const all = coursesBySubjects.reduce((obj, { courses, subjectCode }) => {
    obj[subjectCode] = courses;
    return obj;
  }, {} as { [key: string]: Course[] })

  console.log('DONE! Writing to file...');

  await writeFile('catalog.json', JSON.stringify(all));
}

main();
