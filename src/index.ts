const url = 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_display_courses';
const body = 'term_in=201820&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj=CIS&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25';
import * as got from 'got';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';

async function main() {
  const response = await got.post(url, {
    body,
    ciphers: 'ALL',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  } as any);
  const html = response.body;
}
