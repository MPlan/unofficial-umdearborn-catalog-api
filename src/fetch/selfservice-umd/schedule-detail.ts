import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { oneLineTrim } from 'common-tags';
import { formEncode } from '../../utilities';
import { parseScheduleDetail } from '../../parsers/selfservice-umd/schedule-detail';

export async function fetchScheduleDetail(termCode: string, crn: string) {
  const url = oneLineTrim`
    https://selfservice.umd.umich.edu/BANP/bwckschd.p_disp_detail_sched?
    ${formEncode({
      term_in: termCode,
      crn_in: crn
    })}
  `;

  const response = await axios({
    method: 'POST',
    url,
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    headers: {
      'X-What-Is-This-Request':
        'https://github.com/MPlan/unofficial-umdearborn-catalog-api'
    }
  });

  const html = response.data as string | undefined;
  if (!html) {
    throw new Error('Subjects response was undefined or empty.');
  }

  return parseScheduleDetail(html);
}
