import { JSDOM } from 'jsdom';
import { oneLine } from 'common-tags';
import { isEqual, range } from 'lodash';
import { formDecode, regularToCamelCase } from '../utilities';
import { Section } from '../models/course'

/**
 * given a schedule listing HTML, this returns an array of sections with the following info:
 * 
 * * `ins` instructor unique name
 * * `typ` `Schedule Type` as listed on the page. e.g. `Lecture` or `Internet`
 * * `tim` time of day this section ran/runs at
 * * `day` the days this section ran/runs at
 * * `loc` the location as listed on the page
 * * `cap` the total capacity including the cross-listed seats
 * * `rem` the number of remaining seats including the cross listed courses
 */
export function parseScheduleListing(html: string) {
  const document = new JSDOM(html).window.document;

  const tableBody = document.querySelector('.datadisplaytable tbody');
  if (!tableBody) { return []; }

  const anchors = Array.from(tableBody.querySelectorAll('.ddtitle a')) as HTMLAnchorElement[];

  const crns = (anchors
    .map(a => {
      const decoded = formDecode(a.href || '');
      return decoded.crn_in;
    })
    .filter(x => x)
  );

  const sectionTBodies = Array.from(
    document.querySelectorAll('.datadisplaytable tbody .datadisplaytable tbody')
  ) as HTMLTableSectionElement[];

  if (crns.length !== sectionTBodies.length) {
    throw new Error(oneLine`
      Section count mismatch: The number of section bodies found was ${sectionTBodies.length} but
      found ${crns.length} CRNs.
    `);
  }

  return range(crns.length).map(i => {
    const crn = crns[i];
    const sectionTBody = sectionTBodies[i];
    const section = parseSectionElement(sectionTBody);
    return { crn, ...section };
  });
}

function findUniqueName(element: Element) {
  const anchor = element.querySelector('a');
  if (!anchor) { return undefined; }
  const href = anchor.href;
  if (!href) { return undefined; }
  const match = /mailto:(.*)@umich\.edu/i.exec(href);
  if (!match) { return undefined; }
  return match[1].trim().toLowerCase();
}

function parseSectionElement(sectionTBody: HTMLTableSectionElement) {
  const rows = (Array
    .from(sectionTBody.children)
    .filter(child => child.tagName.toLowerCase().trim() === 'tr')
  ) as HTMLTableRowElement[];

  const headerRow = rows[0];

  if (!headerRow) {
    return undefined;
  }

  const headers = (Array
    .from(headerRow.children)
    .filter(child => child.classList.contains('ddheader'))
    .map(child => child.textContent || '')
    .map(text => regularToCamelCase(text))
  );

  const result = rows.slice(1).reduce((obj, nextRow) => {
    const cells = (Array
      .from(nextRow.querySelectorAll('.dddefault'))
      .map(cell => findUniqueName(cell) || cell.textContent || '')
      .map(text => text.trim())
    );

    for (let i = 0; i < cells.length; i += 1) {
      const next = cells[i];
      const current = obj[headers[i]] || [];
      if (isEqual([next], current)) { continue; }
      const arr = current;
      obj[headers[i]] = [
        ...arr,
        next
      ];
    }

    return obj;
  }, {} as { [key: string]: undefined | string[] });

  const section = {
    ins: result.instructors || [],
    typ: (result.scheduleType || []).map(type => type.toLowerCase().trim()),
    tim: result.time || [],
    day: result.days || [],
    loc: result.where || [],
  }

  return section;
}
