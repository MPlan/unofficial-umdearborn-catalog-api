import { expect } from 'chai';
import { fetchSubjects } from '../../src/fetch/catalog-umd/subjects';
import { parseSubjects } from '../../src/parsers/catalog-umd/subjects';
import { fetchCourses } from '../../src/fetch/catalog-umd/courses';
import { parseCourses } from '../../src/parsers/catalog-umd/courses';
import * as fs from 'fs';
import * as path from 'path';

const catalogSubjectsHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/catalog-subjects.html'))
  .toString();

const catalogCoursesHtml = fs
  .readFileSync(path.resolve(__dirname, '../example-pages/catalog-courses.html'))
  .toString();

describe('catalog subjects parser', function() {
  it('parses subjects and returns a node and code', function() {
    const subjects = parseSubjects(catalogSubjectsHtml);
    // console.log(subjects);

    expect(subjects).to.not.be.empty;
    for (const subject of subjects) {
      expect(subject.name).to.not.be.empty;
      expect(subject.code).to.not.be.empty;
    }
  });
});

describe.only('catalog courses parsers', function() {
  // it('grabs the page', async function() {
  //   const coursesHtml =  await fetchCourses('CIS');
  //   if (!coursesHtml) throw new Error('should not be undefined');
  //   console.log(coursesHtml);
  //   fs.writeFileSync('catalog-courses.html', coursesHtml);;

  // });

  it('parses the courses page', function() {
    const html = parseCourses(catalogCoursesHtml);
    expect(html).to.be.equal(catalogCoursesHtml)
  });
});
