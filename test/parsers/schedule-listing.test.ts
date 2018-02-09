import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { parseScheduleListing } from '../../src/parsers/schedule-listing';
import { parseScheduleDetail } from '../../src/library';
const scheduleListingsHtml = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/schedule-listings.html')
).toString();
const scheduleListingsHtmlWithNoMeetingTimes = fs.readFileSync(
  path.resolve(__dirname, '../example-pages/schedule-listing-with-no-meeting-times.html')
).toString();

describe(`schedule listing parser`, function () {
  it(`parsers 'schedule-listings.html'`, function () {
    const result = parseScheduleListing(scheduleListingsHtml);

    const expectedResult = [
      {
        crn: '20070',
        ins: ['adityavv'],
        typ: ['recitation'],
        tim: ['9:00 am - 9:50 am', '9:30 am - 10:45 am'],
        day: ['M', 'WF'],
        loc: ['CAS&L Building 2070']
      },
      {
        crn: '20071',
        ins: ['mmacany'],
        typ: ['recitation'],
        tim: ['10:00 am - 10:50 am', '9:30 am - 10:45 am'],
        day: ['M', 'TR'],
        loc: ['CAS&L Building 2070']
      },
      {
        crn: '20072',
        ins: ['nlavrov'],
        typ: ['recitation'],
        tim: ['1:00 pm - 1:50 pm', '12:30 pm - 1:45 pm'],
        day: ['M', 'WF'],
        loc: ['CAS&L Building 2062']
      },
      {
        crn: '20083',
        ins: ['bazzia'],
        typ: ['recitation'],
        tim: ['11:00 am - 11:50 am', '11:00 am - 12:15 pm'],
        day: ['M', 'TR'],
        loc: ['CAS&L Building 1086']
      },
      {
        crn: '21684',
        ins: ['Benjamin   Phillips (P)'],
        typ: ['recitation'],
        tim: ['1:00 pm - 1:50 pm', '12:30 pm - 1:45 pm'],
        day: ['M', 'TR'],
        loc: ['CAS&L Building 2063']
      },
      {
        crn: '20085',
        ins: ['jabbusch'],
        typ: ['recitation'],
        tim: ['2:00 pm - 2:50 pm', '2:00 pm - 3:15 pm'],
        day: ['M', 'WF'],
        loc: ['CAS&L Building 2090', 'CAS&L Building 2048']
      },
      {
        crn: '20086',
        ins: ['mmacany'],
        typ: ['recitation'],
        tim: ['2:00 pm - 2:50 pm', '2:00 pm - 3:15 pm'],
        day: ['M', 'TR'],
        loc: ['CAS&L Building 2070']
      },
      {
        crn: '20361',
        ins: ['beydoung'],
        typ: ['recitation'],
        tim: ['6:00 pm - 7:45 pm'],
        day: ['TR'],
        loc: ['CAS&L Building 2062']
      },
      {
        crn: '22655',
        ins: ['jeffigo'],
        typ: ['recitation'],
        tim: ['4:00 pm - 5:45 pm'],
        day: ['TR'],
        loc: ['CAS&L Building 2062']
      }
    ];

    expect(result).to.be.deep.equal(expectedResult);
  });

  it(`parses schedules listings with no meetings times`, function () {
    const result = parseScheduleListing(scheduleListingsHtmlWithNoMeetingTimes);

    const expectedResult = [
      {
        crn: '21206',
        ins: [],
        typ: [],
        tim: [],
        day: [],
        loc: [],
      },
      {
        crn: '22759',
        ins: ['marilee'],
        typ: ['independent study'],
        tim: ['TBA'],
        day: [],
        loc: ['TBA']
      }
    ];

    expect(result).to.be.deep.equal(expectedResult)
  });
});
