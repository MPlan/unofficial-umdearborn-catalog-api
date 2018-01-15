import { JSDOM } from 'jsdom';
import { formDecode } from '../utilities';

export function parseScheduleListing(html: string) {
  const document = new JSDOM(html).window.document;

  const anchors = Array.from(document.querySelectorAll('.ddtitle a')) as HTMLAnchorElement[];

  const crnObjects = (anchors
    .map(a => {
      const decoded = formDecode(a.href || '');
      return decoded.crn_in;
    })
    .filter(x => x)
    .reduce((obj, crn) => {
      obj[crn] = true;
      return obj;
    }, {} as { [crn: string]: true })
  );

  const crns = Object.keys(crnObjects);
  return crns;
}
