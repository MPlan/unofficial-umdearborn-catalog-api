import axios from 'axios';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { oneLineTrim } from 'common-tags';
import { formEncode } from '../utilities';
import { parseCatalogEntriesHtml } from '../parsers/catalog-parser';

export interface Subject {
  code: string,
  name: string,
}

export async function fetchCatalogEntries(termCode: string, subjectCode: string) {

  const data = oneLineTrim`
    term_in=${termCode}&
    call_proc_in=bwckctlg.p_disp_dyn_ctlg&
    sel_subj=dummy&
    sel_levl=dummy&
    sel_schd=dummy&
    sel_coll=dummy&
    sel_divs=dummy&
    sel_dept=dummy&
    sel_attr=dummy&
    sel_subj=${subjectCode}&
    sel_crse_strt=&
    sel_crse_end=&
    sel_title=&
    sel_levl=%25&
    sel_schd=%25&
    sel_coll=%25&
    sel_divs=%25&
    sel_dept=%25&
    sel_from_cred=&
    sel_to_cred=&
    sel_attr=%25
  `;

  const response = await axios({
    method: 'POST',
    url: 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_display_courses',
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
    }
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

  return parseCatalogEntriesHtml(html);
}
