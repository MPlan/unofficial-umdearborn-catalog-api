import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { oneLineTrim } from 'common-tags';
import { formEncode } from '../utilities';
import { parseScheduleListing } from '../parsers/schedule-listing';

export async function fetchScheduleListings(
  termCode: string,
  subjectCode: string,
  courseNumber: string,
  scheduleTypeCode: string,
) {

  const url = oneLineTrim`
    https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_listcrse?
    ${formEncode({
      term_in: termCode,
      subj_in: subjectCode,
      crse_in: courseNumber,
      schd_in: scheduleTypeCode,
    })}
  `;

  const response = await axios({
    method: 'POST',
    url,
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    headers: {
      'X-What-Is-This-Request': 'https://github.com/MPlan/unofficial-umdearborn-catalog-api',
    },
  });

  const html = response.data as string | undefined;
  if (!html) {
    throw new Error('Subjects response was undefined or empty.');
  }

  return parseScheduleListing(html);
}
