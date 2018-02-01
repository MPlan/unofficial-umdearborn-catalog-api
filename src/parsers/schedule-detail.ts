import { JSDOM } from 'jsdom';
import { regularToCamelCase, formDecode } from '../utilities';
import { range } from 'lodash';
import { decode } from 'he';

export function parseCapacityAndRemaining(seatsTbody: HTMLTableSectionElement) {
  const empty = { cap: NaN, rem: NaN };
  const rows = (Array
    .from(seatsTbody.children)
    .filter(elem => elem.tagName.toLowerCase().trim() === 'tr')
  );

  const headerRow = rows[0];

  if (!headerRow) { return empty; }

  const headings = (Array
    .from(headerRow.children)
    .slice(1)
    .map(cell => cell.textContent || '')
    .map(text => regularToCamelCase(text))
  );

  const result = (rows
    .slice(1)
    .reduce((obj, row) => {
      const cells = Array.from(row.children);
      const firstCell = cells[0];
      if (!firstCell) { return obj; } // continue

      const key = regularToCamelCase(firstCell.textContent || '').toLowerCase();
      const values = (cells
        .slice(1)
        .map(cell => cell.textContent || '')
        .map(text => parseInt(text.trim()))
      );

      const value = (range(values.length)
        .map(i => ({ key: headings[i], value: values[i] }))
        .reduce((obj, { key, value }) => {
          obj[key] = value;
          return obj;
        }, {} as { [key: string]: number })
      );

      obj[key] = value;

      return obj;
    }, {} as { [seatType: string]: { [heading: string]: number } })
  );

  if (result.crosslistseats) {
    const cap = result.crosslistseats && result.crosslistseats.capacity || NaN;
    const rem = result.crosslistseats && result.crosslistseats.remaining || NaN;
    return { cap, rem };
  } else if (result.seats) {
    const cap = result.seats && result.seats.capacity || NaN;
    const rem = result.seats && result.seats.remaining || NaN;
    return { cap, rem };
  }

  return empty;
}

export function parseCreditHours(infoCell: Element) {
  const textContent = infoCell.textContent || '';
  const creditHourRangeMatch = /((?:\d|\.)*)\s*to\s*((?:\d|\.)*)\s*credits/i.exec(textContent);
  if (creditHourRangeMatch) {
    const creditsMin = parseFloat(creditHourRangeMatch[1]);
    const credits = parseFloat(creditHourRangeMatch[2]);
    return { creditsMin, credits };
  }

  const creditHourMatch = /((?:\d|\.)*)\s*credits/i.exec(textContent);

  if (creditHourMatch) {
    const credits = parseFloat(creditHourMatch[1]);
    return { credits, creditsMin: undefined };
  }

  return { credits: NaN, creditsMin: undefined };
}

export function parseCrossListedCourses(infoCell: Element) {
  const match = /cross\s*list\s*courses([\s\S]*)<table/i.exec(infoCell.innerHTML);
  if (!match) { return []; }

  try {
    const document = new JSDOM(match[1]).window.document;
    const anchors = Array.from(document.querySelectorAll('a'));

    const crossListedCourses = (anchors
      .map(anchor => anchor.href)
      .filter(x => !!x)
      .map(href => {
        const match = /\?(.*)/.exec(href);
        if (!match) { return undefined; }
        const decoded = formDecode(decode(match[1]));
        return [
          decoded.one_subj.trim().toUpperCase(),
          decoded.sel_crse_strt.toUpperCase()
        ] as [string, string];
      })
      .filter(x => x && x.length > 0)
      .map(x => x!)
    );

    return crossListedCourses;

  } catch (e) {
    console.warn('Error in parsing cross listed courses.', e);
    return [];
  }
}

type ScheduleDetailResult = {
  cap: number,
  rem: number,
  credits: number,
  creditsMin: number | undefined,
  crossList: [string, string][],
};

/**
 * captures the `cap` and `rem` of a section detail HTML
 */
export function parseScheduleDetail(html: string) {
  const document = new JSDOM(html).window.document;

  const seatsTbody = (document.querySelector(
    '.datadisplaytable tbody .datadisplaytable tbody'
  ) || document.createElement('tbody')) as HTMLTableSectionElement;

  const infoCell = document.querySelector(
    '.datadisplaytable tbody .dddefault'
  ) || document.createElement('td');

  const capAndRem = parseCapacityAndRemaining(seatsTbody);
  const creditHours = parseCreditHours(infoCell);
  const crossList = parseCrossListedCourses(infoCell);

  const result: ScheduleDetailResult = { ...capAndRem, ...creditHours, crossList };
  return result;
}
