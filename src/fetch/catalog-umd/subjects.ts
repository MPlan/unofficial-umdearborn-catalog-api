import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
// import { parseTerms } from '../../p/';

export async function fetchSubjects() {
  const subjectsResponse = await axios({
    method: 'GET',
    url: 'http://catalog.umd.umich.edu/undergraduate/coursesaz/',
    headers: {
      'X-What-Is-This-Request':
        'https://github.com/MPlan/unofficial-umdearborn-catalog-api'
    }
  });

  const html = subjectsResponse.data as string | undefined;
  return html;
}
