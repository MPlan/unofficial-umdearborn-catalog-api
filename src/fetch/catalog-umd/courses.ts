import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';

export async function fetchCourses(subjectCode: string) {
  const coursesResponse = await axios({
    method: 'GET',
    url: `http://catalog.umd.umich.edu/undergraduate/coursesaz/${subjectCode.toLowerCase().trim()}/`,
    headers: {
      'X-What-Is-This-Request':
        'https://github.com/MPlan/unofficial-umdearborn-catalog-api'
    }
  });

  const html = coursesResponse.data as string | undefined;
  return html;
}
