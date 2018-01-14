import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { formEncode } from '../utilities';

export interface Subject {
  code: string,
  name: string,
}

export async function fetchSubjects(termCode: string) {
  const response = await axios({
    method: 'POST',
    url: 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_cat_term_date',
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    data: formEncode({ call_proc_in: 'bwckctlg.p_disp_dyn_ctlg', cat_term_in: termCode })
  });

  if (response.status !== 200) {
    throw new Error(
      `Subjects request returned non-200 response code: '${response.status}'!`
    );
  }
  const html = response.data as string | undefined;
  if (!html) {
    throw new Error('Subjects response was undefined or empty.');
  }
  const document = new JSDOM(html).window.document;
  const selectBox = document.querySelector('select[name=sel_subj]') as HTMLSelectElement | null;
  if (!selectBox) { throw new Error('No subject select box in subjects HTML.'); }
  const options = Array.from(selectBox.querySelectorAll('option')) as HTMLOptionElement[];
  const subjects = (options
    .map(option => {
      const subject: Subject = {
        code: option.value,
        name: option.text.trim(),
      };
      return subject;
    })
  );
  return subjects;
}
