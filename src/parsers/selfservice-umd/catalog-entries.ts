import { JSDOM } from 'jsdom';
import { formDecode } from '../../utilities';
import { decode } from 'he';

export type CatalogEntryResult = {
  subjectCode: string;
  courseNumber: string;
  name: string;
  scheduleTypes: string[];
};

export function parseHeader(header: string) {
  const titleSplit = header.split('-');
  const subjectAndNumber = decode(titleSplit[0] || '');
  const title = decode(
    titleSplit
      .slice(1)
      .join('-')
      .trim()
  );
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subjectCode = decode(
    (subjectAndNumberSplit[0] || '').toUpperCase().trim()
  );
  const courseNumber = decode(
    subjectAndNumberSplit
      .slice(1)
      .join(' ')
      .trim()
  );
  return { title, subjectCode, courseNumber };
}

interface HtmlCatalogEntry {
  heading: HTMLTableRowElement;
  body: HTMLTableRowElement;
}

export function parseCatalogEntries(html: string) {
  const document = new JSDOM(html).window.document;

  const dataTableRows: HTMLTableRowElement[] = Array.from(
    document.querySelectorAll('.datadisplaytable tr')
  );

  const htmlCatalogEntries = dataTableRows.reduce(
    (groups, headingOrBody: HTMLTableRowElement, index) => {
      const i = Math.floor(index / 2);
      const group = groups[i] || { heading: null, body: null };
      if (index % 2 === 0) {
        group.heading = headingOrBody;
      } else {
        group.body = headingOrBody;
      }
      groups[i] = group;
      return groups;
    },
    [] as HtmlCatalogEntry[]
  );

  const parsedGroups = htmlCatalogEntries
    .filter(
      htmlCatalogEntry => !!htmlCatalogEntry.heading && !!htmlCatalogEntry.body
    )
    .map(htmlCatalogEntry => {
      const headingRow = htmlCatalogEntry.heading;
      const titleElement =
        headingRow &&
        (headingRow.querySelector('.nttitle a') as HTMLAnchorElement | null);
      const titleSubjectAndNumber =
        titleElement && parseHeader(titleElement.innerHTML);

      const name = (titleSubjectAndNumber && titleSubjectAndNumber.title) || '';
      const subjectCode =
        (titleSubjectAndNumber && titleSubjectAndNumber.subjectCode) || '';
      const courseNumber =
        (titleSubjectAndNumber && titleSubjectAndNumber.courseNumber) || '';
      const detailHref = (titleElement && titleElement.href) || '';

      const scheduleTypesObject = Array.from(
        htmlCatalogEntry.body.querySelectorAll('a')
      )
        .filter(a => {
          if (!a.href) {
            return false;
          }
          const querySplit = a.href.split('?');
          const queryEncoded = querySplit[1];
          if (!queryEncoded) {
            return false;
          }
          const query = formDecode(queryEncoded);
          if (
            query.subj_in.toUpperCase().trim() !== subjectCode.toUpperCase()
          ) {
            return false;
          }
          if (
            query.crse_in.toUpperCase().trim() !== courseNumber.toUpperCase()
          ) {
            return false;
          }
          if (!query.schd_in) {
            return false;
          }
          return true;
        })
        .map(a => {
          const querySplit = a.href.split('?');
          const queryEncoded = querySplit[1];
          const query = formDecode(queryEncoded);
          return query.schd_in;
        })
        .reduce(
          (scheduleTypes, scheduleType) => {
            scheduleTypes[scheduleType.trim().toUpperCase()] = scheduleType;
            return scheduleTypes;
          },
          {} as { [scheduleType: string]: string }
        );

      const scheduleTypes = Object.keys(scheduleTypesObject);

      const catalogEntry: CatalogEntryResult = {
        name,
        subjectCode,
        courseNumber,
        scheduleTypes
      };
      return catalogEntry;
    })
    .filter(catalogEntry => {
      return Object.keys(catalogEntry).every(
        objectKey => !!catalogEntry[objectKey as keyof CatalogEntryResult]
      );
    });
  return parsedGroups;
}
