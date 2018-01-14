import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';

interface Term {
  key: string,
  season: string,
  year: number,
}

export async function fetchTerms() {
  const catalogTermResponse = await axios({
    method: 'GET',
    url: 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_dyn_ctlg',
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
  });

  if (catalogTermResponse.status !== 200) {
    throw new Error(
      `Catalog term request returned non-200 response code: '${catalogTermResponse.status}'!`
    );
  }
  const catalogTermHtml = catalogTermResponse.data as string | undefined;
  if (!catalogTermHtml) {
    throw new Error('Catalog term response was undefined or empty.');
  }
  const document = new JSDOM(catalogTermHtml).window.document;
  const termsSelect = document.querySelector('#term_input_id') as HTMLSelectElement | null;
  if (!termsSelect) { throw new Error('No term select box in catalog terms HTML.'); }
  const termsOptions = Array.from(termsSelect.querySelectorAll('option')) as HTMLOptionElement[];
  const terms = (termsOptions
    .filter(option => {
      return !!/(\w*) (\d*)/.exec(option.text);
    })
    .map(option => {
      const [rawSeason, rawYear] = option.text.split(' ');

      const term: Term = {
        key: option.value,
        season: rawSeason.toLowerCase().trim(),
        year: parseInt(rawYear.trim()),
      };

      return term;
    })
  );
  return terms;
}
