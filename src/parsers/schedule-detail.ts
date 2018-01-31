import { JSDOM } from 'jsdom';
import { regularToCamelCase } from '../utilities';
import { range } from 'lodash';

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
    return { credits, creditsMin: NaN };
  }

  return { credits: NaN, creditsMin: NaN };
}

type ScheduleDetailResult = {
  cap: number,
  rem: number,
  credits: number,
  creditsMin: number,
};

/**
 * captures the `cap` and `rem` of a section detail HTML
 */
export function parseScheduleDetail(html: string) {
  const document = new JSDOM(html).window.document;

  const seatsTbody = document.querySelector(
    '.datadisplaytable tbody .datadisplaytable tbody'
  ) as HTMLTableSectionElement | null;

  const infoCell = document.querySelector(
    '.datadisplaytable tbody .dddefault'
  ) as Element | null;

  const capAndRem = parseCapacityAndRemaining(seatsTbody || document.createElement('tbody'));
  const creditHours = parseCreditHours(infoCell || document.createElement('td'));

  const result: ScheduleDetailResult = { ...capAndRem, ...creditHours };
  return result;
}
