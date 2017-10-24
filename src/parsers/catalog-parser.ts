import { JSDOM } from 'jsdom';

const catalogEntryKeys = ['subjectCode', 'courseNumber', 'title', 'href'];
export interface CatalogEntry {
  subjectCode: string,
  courseNumber: string,
  title: string,
  href: string,
}

export function parseHeader(header: string) {
  const titleSplit = header.split('-');
  const subjectAndNumber = titleSplit[0] || '';
  const title = titleSplit.slice(1).join('-').trim();
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subjectCode = (subjectAndNumberSplit[0] || '').toUpperCase().trim();
  const courseNumber = subjectAndNumberSplit.slice(1).join(' ').trim();
  return { title, subjectCode, courseNumber };
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
    const titleSubjectAndNumber = titleElement && parseHeader(titleElement.innerHTML);
    return {
      title: titleSubjectAndNumber && titleSubjectAndNumber.title || '',
      subjectCode: titleSubjectAndNumber && titleSubjectAndNumber.subjectCode || '',
      courseNumber: titleSubjectAndNumber && titleSubjectAndNumber.courseNumber || '',
      href: titleElement && titleElement.href || '',
    } as CatalogEntry;
  }).filter(catalogEntry => {
    return Object.keys(catalogEntry).every(objectKey => catalogEntryKeys.includes(objectKey));
  });
  return parsedGroups;
}