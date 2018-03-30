import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { formEncode } from '../../utilities';
import { parseSubjects } from '../../parsers/selfservice-umd/subjects';

export async function fetchSubjects(termCode: string) {
  const response = await axios({
    method: 'POST',
    url: 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_cat_term_date',
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    data: formEncode({
      call_proc_in: 'bwckctlg.p_disp_dyn_ctlg',
      cat_term_in: termCode
    }),
    headers: {
      'X-What-Is-This-Request':
        'https://github.com/MPlan/unofficial-umdearborn-catalog-api'
    }
  });

  const html = response.data as string | undefined;
  if (!html) {
    throw new Error('Subjects response was undefined or empty.');
  }
  return parseSubjects(html);
}
