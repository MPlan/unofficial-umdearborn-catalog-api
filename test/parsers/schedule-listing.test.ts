import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { parseScheduleListing } from '../../src/parsers/schedule-listing';
const scheduleListingsHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/schedule-listings.html')
).toString();

describe(`schedule listing parser`, function () {
  it(`parsers 'schedule-listings.html'`, function () {
    const crns = parseScheduleListing(scheduleListingsHtml);

    expect(crns).to.have.same.members(['20156', '22609']);
  });
});
