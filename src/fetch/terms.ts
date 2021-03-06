import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { parseTerms } from '../parsers/terms';

export async function fetchTerms() {
  const catalogTermResponse = await axios({
    method: 'GET',
    url: 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_dyn_ctlg',
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    headers: {
      'X-What-Is-This-Request':
        'https://github.com/MPlan/unofficial-umdearborn-catalog-api'
    }
  });

  const html = catalogTermResponse.data as string | undefined;
  if (!html) {
    throw new Error('Catalog term response was undefined or empty.');
  }
  return parseTerms(html);
}
