import { JSDOM } from 'jsdom';
import { CatalogEntry } from '../models/catalog-entry';

const catalogEntryKeys: (keyof CatalogEntry)[] = ['subjectCode', 'courseNumber', 'title', 'href'];

export function parseHeader(header: string) {
  const titleSplit = header.split('-');
  const subjectAndNumber = titleSplit[0] || '';
  const title = titleSplit.slice(1).join('-').trim();
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subjectCode = (subjectAndNumberSplit[0] || '').toUpperCase().trim();
  const courseNumber = subjectAndNumberSplit.slice(1).join(' ').trim();
  return { title, subjectCode, courseNumber };
}

export function parseCatalogEntries(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;

  const dataTableRows: HTMLTableRowElement[] = Array.from(
    document.querySelectorAll('.datadisplaytable tr')
  );

  const headingRows = dataTableRows.reduce((groups, headingOrBody: HTMLTableRowElement, index) => {
    if (index % 2 === 0) {
      groups.push(headingOrBody);
    }
    return groups;
  }, [] as HTMLTableRowElement[]);

  const parsedGroups = (headingRows
    .map(headingRow => {
      const titleElement = headingRow && headingRow.querySelector('.nttitle a') as HTMLAnchorElement | null;
      const titleSubjectAndNumber = titleElement && parseHeader(titleElement.innerHTML);
      const catalogEntry: CatalogEntry = {
        title: titleSubjectAndNumber && titleSubjectAndNumber.title || '',
        subjectCode: titleSubjectAndNumber && titleSubjectAndNumber.subjectCode || '',
        courseNumber: titleSubjectAndNumber && titleSubjectAndNumber.courseNumber || '',
        href: titleElement && titleElement.href || '',
      };
      return catalogEntry;
    })
    .filter(catalogEntry => {
      return (Object
        .keys(catalogEntry)
        .every(objectKey =>
          catalogEntryKeys.includes(objectKey as any) && !!catalogEntry[objectKey as keyof CatalogEntry]
        )
      );
    })
  );
  return parsedGroups;
}
