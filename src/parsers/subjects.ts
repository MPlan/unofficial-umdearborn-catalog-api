import { JSDOM } from 'jsdom';

export interface SubjectResult {
  code: string,
  name: string,
}

export function parseSubjects(html: string) {
  const document = new JSDOM(html).window.document;
  const selectBox = document.querySelector('select[name=sel_subj]') as HTMLSelectElement | null;
  if (!selectBox) { throw new Error('No subject select box in subjects HTML.'); }
  const options = Array.from(selectBox.querySelectorAll('option')) as HTMLOptionElement[];
  const subjects = (options
    .map(option => {
      const subject: SubjectResult = {
        code: option.value,
        name: option.text.trim(),
      };
      return subject;
    })
  );
  return subjects;
}
