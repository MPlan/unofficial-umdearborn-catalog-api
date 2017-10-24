import { JSDOM } from 'jsdom';

const catalogEntryKeys = ['subjectCode', 'courseNumber', 'title', 'href'];
export interface CatalogEntry {
  subjectCode: string,
  courseNumber: string,
  title: string,
  href: string,
}

export function parseTitle(rawTitle: string) {
  const titleSplit = rawTitle.split('-');
  const subjectAndNumber = titleSplit[0] || '';
  const title = titleSplit.slice(1).join('-').trim();
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subject = (subjectAndNumberSplit[0] || '').toUpperCase().trim();
  const number = subjectAndNumberSplit.slice(1).join(' ').trim();
  return { title, subject, number };
}

export function parseCatalogEntriesHtml(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;

  const dataTableRows = Array.from(document.querySelectorAll('.datadisplaytable tr'));

  const headingRows = dataTableRows.reduce((groups, headingOrBody: HTMLTableRowElement, index) => {
    if (index % 2 === 0) {
      groups.push(headingOrBody);
    }
    return groups;
  }, [] as HTMLTableRowElement[]);

  const parsedGroups = headingRows.map(headingRow => {
    const titleElement = headingRow && headingRow.querySelector('.nttitle a') as HTMLAnchorElement | null;
    const titleSubjectAndNumber = titleElement && parseTitle(titleElement.innerHTML);
    return {
      title: titleSubjectAndNumber && titleSubjectAndNumber.title || '',
      subjectCode: titleSubjectAndNumber && titleSubjectAndNumber.subject || '',
      courseNumber: titleSubjectAndNumber && titleSubjectAndNumber.number || '',
      href: titleElement && titleElement.href || '',
    } as CatalogEntry;
  }).filter(catalogEntry => {
    return Object.keys(catalogEntry).every(objectKey => catalogEntryKeys.includes(objectKey));
  });
  return parsedGroups;
}