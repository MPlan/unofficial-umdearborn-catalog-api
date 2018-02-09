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
        courseRegistrationNumber: '20070',
        instructor: ['adityavv'],
        scheduleType: ['recitation'],
        time: ['9:00 am - 9:50 am', '9:30 am - 10:45 am'],
        days: ['M', 'WF'],
        locations: ['CAS&L Building 2070']
      },
      {
        courseRegistrationNumber: '20071',
        instructor: ['mmacany'],
        scheduleType: ['recitation'],
        time: ['10:00 am - 10:50 am', '9:30 am - 10:45 am'],
        days: ['M', 'TR'],
        locations: ['CAS&L Building 2070']
      },
      {
        courseRegistrationNumber: '20072',
        instructor: ['nlavrov'],
        scheduleType: ['recitation'],
        time: ['1:00 pm - 1:50 pm', '12:30 pm - 1:45 pm'],
        days: ['M', 'WF'],
        locations: ['CAS&L Building 2062']
      },
      {
        courseRegistrationNumber: '20083',
        instructor: ['bazzia'],
        scheduleType: ['recitation'],
        time: ['11:00 am - 11:50 am', '11:00 am - 12:15 pm'],
        days: ['M', 'TR'],
        locations: ['CAS&L Building 1086']
      },
      {
        courseRegistrationNumber: '21684',
        instructor: ['Benjamin   Phillips (P)'],
        scheduleType: ['recitation'],
        time: ['1:00 pm - 1:50 pm', '12:30 pm - 1:45 pm'],
        days: ['M', 'TR'],
        locations: ['CAS&L Building 2063']
      },
      {
        courseRegistrationNumber: '20085',
        instructor: ['jabbusch'],
        scheduleType: ['recitation'],
        time: ['2:00 pm - 2:50 pm', '2:00 pm - 3:15 pm'],
        days: ['M', 'WF'],
        locations: ['CAS&L Building 2090', 'CAS&L Building 2048']
      },
      {
        courseRegistrationNumber: '20086',
        instructor: ['mmacany'],
        scheduleType: ['recitation'],
        time: ['2:00 pm - 2:50 pm', '2:00 pm - 3:15 pm'],
        days: ['M', 'TR'],
        locations: ['CAS&L Building 2070']
      },
      {
        courseRegistrationNumber: '20361',
        instructor: ['beydoung'],
        scheduleType: ['recitation'],
        time: ['6:00 pm - 7:45 pm'],
        days: ['TR'],
        locations: ['CAS&L Building 2062']
      },
      {
        courseRegistrationNumber: '22655',
        instructor: ['jeffigo'],
        scheduleType: ['recitation'],
        time: ['4:00 pm - 5:45 pm'],
        days: ['TR'],
        locations: ['CAS&L Building 2062']
      }
    ];

    expect(result).to.be.deep.equal(expectedResult);
  });

  it(`parses schedules listings with no meetings times`, function () {
    const result = parseScheduleListing(scheduleListingsHtmlWithNoMeetingTimes);
    const expectedResult = [
      {
        courseRegistrationNumber: '21206',
        days: [],
        instructor: [],
        locations: [],
        scheduleType: [],
        time: []
      },
      {
        courseRegistrationNumber: '22759',
        instructor: ['marilee'],
        scheduleType: ['independent study'],
        time: ['TBA'],
        days: [''],
        locations: ['TBA']
      }
    ];

    expect(result).to.deep.equal(expectedResult);
  });
});
