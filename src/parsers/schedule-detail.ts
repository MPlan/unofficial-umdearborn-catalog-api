import { JSDOM } from 'jsdom';
import { regularToCamelCase } from '../utilities';
import { range } from 'lodash';

/**
 * captures the `cap` and `rem` of a section detail HTML
 */
export function parseScheduleDetail(html: string) {
  const document = new JSDOM(html).window.document;

  const tbody = document.querySelector('.datadisplaytable tbody .datadisplaytable tbody');

  if (!tbody) { return undefined; }

  const rows = (Array
    .from(tbody.children)
    .filter(elem => elem.tagName.toLowerCase().trim() === 'tr')
  );

  const headerRow = rows[0];

  if (!headerRow) { return undefined; }

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

      const key = regularToCamelCase(firstCell.textContent || '');
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

  const cap = result.crossListSeats.capacity || result.seats.capacity;
  const rem = result.crossListSeats.remaining || result.seats.remaining;

  return { cap, rem };
}