import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import {
  parseScheduleDetail, parseCapacityAndRemaining, parseCreditHours
} from '../../src/parsers/schedule-detail';
const scheduleDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/schedule-detail.html')
).toString();

const document = new JSDOM(scheduleDetailHtml).window.document;

describe(`schedule detail parser`, function () {
  it(`parsers 'schedule-detail.html'`, function () {
    const result = parseScheduleDetail(scheduleDetailHtml);
    expect(result).to.be.deep.equal({
      cap: 35,
      rem: 1,
      credits: 4,
      creditsMin: undefined,
      crossList: [['ECE', '478']]
    });
  });
  it(`parses the crosslisted seats: capacity and remaining`, function () {
    const seatsTbody = document.querySelector(
      '.datadisplaytable tbody .datadisplaytable tbody'
    ) as HTMLTableSectionElement | null;

    const { cap, rem } = parseCapacityAndRemaining(seatsTbody || document.createElement('tbody'));
    expect(cap).to.be.equal(35);
    expect(rem).to.be.equal(1);
  });
  it(`parses the credits or credit range`, function () {
    const infoCell = document.querySelector(
      '.datadisplaytable tbody .dddefault'
    ) as Element | null;

    const { credits, creditsMin } = parseCreditHours(infoCell || document.createElement('div'));
    expect(credits).to.be.equal(4);
    expect(creditsMin).to.be.undefined;
  });
});
