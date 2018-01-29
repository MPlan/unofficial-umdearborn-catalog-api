import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { parseScheduleDetail } from '../../src/parsers/schedule-detail';
const scheduleDetailHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/schedule-detail.html')
).toString();

describe(`schedule detail parser`, function () {
  it(`parsers 'schedule-detail.html'`, function () {
    const result = parseScheduleDetail(scheduleDetailHtml);
    expect(result).to.be.deep.equal({ cap: 35, rem: 1 });
  });
});
