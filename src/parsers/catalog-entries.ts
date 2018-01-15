import { JSDOM } from 'jsdom';
import { CatalogEntry } from '../models/catalog-entry';
import { formDecode } from '../utilities';

export function parseHeader(header: string) {
  const titleSplit = header.split('-');
  const subjectAndNumber = titleSplit[0] || '';
  const title = titleSplit.slice(1).join('-').trim();
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subjectCode = (subjectAndNumberSplit[0] || '').toUpperCase().trim();
  const courseNumber = subjectAndNumberSplit.slice(1).join(' ').trim();
  return { title, subjectCode, courseNumber };
}

interface HtmlCatalogEntry {
  heading: HTMLTableRowElement,
  body: HTMLTableRowElement,
}

export function parseCatalogEntries(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;

  const dataTableRows: HTMLTableRowElement[] = Array.from(
    document.querySelectorAll('.datadisplaytable tr')
  );

  const htmlCatalogEntries = dataTableRows.reduce((
    groups,
    headingOrBody: HTMLTableRowElement,
    index
  ) => {
    const i = Math.floor(index / 2);
    const group = groups[i] || { heading: null, body: null, };
    if (index % 2 === 0) {
      group.heading = headingOrBody;
    } else {
      group.body = headingOrBody;
    }
    groups[i] = group;
    return groups;
  }, [] as HtmlCatalogEntry[]);

  const parsedGroups = (htmlCatalogEntries
    .filter(htmlCatalogEntry => !!htmlCatalogEntry.heading && !!htmlCatalogEntry.body)
    .map(htmlCatalogEntry => {
      const headingRow = htmlCatalogEntry.heading;
      const titleElement = headingRow && headingRow.querySelector('.nttitle a') as HTMLAnchorElement | null;
      const titleSubjectAndNumber = titleElement && parseHeader(titleElement.innerHTML);

      const name = titleSubjectAndNumber && titleSubjectAndNumber.title || '';
      const subjectCode = titleSubjectAndNumber && titleSubjectAndNumber.subjectCode || '';
      const courseNumber = titleSubjectAndNumber && titleSubjectAndNumber.courseNumber || '';
      const detailHref = titleElement && titleElement.href || '';

      const scheduleHrefs = (Array
        .from(htmlCatalogEntry.body.querySelectorAll('a'))
        .filter(a => {
          if (!a.href) { return false; }
          const querySplit = a.href.split('?');
          const queryEncoded = querySplit[1];
          if (!queryEncoded) { return false; }
          const query = formDecode(queryEncoded);
          if (query.subj_in.toUpperCase().trim() !== subjectCode.toUpperCase()) { return false; }
          if (query.crse_in.toUpperCase().trim() !== courseNumber.toUpperCase()) { return false; }
          if (!query.schd_in) { return false; }
          return true;
        })
        .map(a => {
          const querySplit = a.href.split('?');
          const queryEncoded = querySplit[1];
          const query = formDecode(queryEncoded);
          return { scheduleType: query.schd_in, href: a.href };
        })
        .reduce((scheduleHrefs, { scheduleType, href }) => {
          scheduleHrefs[scheduleType.trim().toUpperCase()] = href;
          return scheduleHrefs;
        }, {} as { [scheuledType: string]: string })
      );

      const catalogEntry: CatalogEntry = {
        name, subjectCode, courseNumber, detailHref, scheduleHrefs,
      };
      return catalogEntry;
    })
    .filter(catalogEntry => {
      return (Object
        .keys(catalogEntry)
        .every(objectKey => !!catalogEntry[objectKey as keyof CatalogEntry])
      );
    })
  );
  return parsedGroups;
}
