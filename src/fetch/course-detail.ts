import axios from 'axios';
import * as https from 'https';
import { oneLineTrim } from 'common-tags';
import { formEncode } from '../utilities';
import { parseCourseDetail } from '../parsers/course-detail';

export async function fetchCourseDetail(
  termCode: string,
  subjectCode: string,
  courseNumber: string,
) {

  const url = oneLineTrim`
    https://selfservice.umd.umich.edu/BANP/bwckctlg.p_disp_course_detail?
    ${formEncode({
      cat_term_in: termCode.trim().toUpperCase(),
      subj_code_in: subjectCode.trim().toUpperCase(),
      crse_numb_in: courseNumber.trim().toUpperCase(),
    })}
  `;

  const response = await axios({
    method: 'GET',
    url,
    httpsAgent: new https.Agent({ ciphers: 'ALL' }),
  });

  const html = response.data as string | undefined;
  if (!html) {
    throw new Error('Course detail response was undefined or empty.');
  }

  return parseCourseDetail(html);
}
