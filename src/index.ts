const url = 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_display_courses';
const body = 'term_in=201820&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj=CIS&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25';
import * as got from 'got';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';

async function main() {
  const response = await got.post(url, {
    body,
    ciphers: 'ALL',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  } as any);
  const html = response.body;
  fs.writeFileSync('course-list.html', html);
}

const html = fs.readFileSync('course-list.html').toString();

function parseTitle(rawTitle: string) {
  const titleSplit = rawTitle.split('-');
  const subjectAndNumber = titleSplit[0] || '';
  const title = titleSplit.slice(1).join('-').trim();
  const subjectAndNumberSplit = subjectAndNumber.split(' ');
  const subject = (subjectAndNumberSplit[0] || '').toUpperCase().trim();
  const number = subjectAndNumberSplit.slice(1).join(' ').trim();
  return { title, subject, number };
}

function parseHours(
  body: string,
  previous = {} as { [key: string]: number }
): { [key: string]: number } {
  const regex = /([\d.]+)\s+(\S+)\s+hours\s+/.exec(body);
  if (!regex) {
    return previous;
  }
  const hours = parseFloat(regex[1].trim());
  const type = regex[2].trim();
  previous[type] = hours;

  return parseHours(body.slice(regex.index + regex[0].length), previous);
}

function parseLevels(body: string) {
  const regex = /Levels:(.+)/g.exec(body);
  if (!regex) {
    return [];
  };
  return regex[1].trim().split(',').map(x => x.trim());
}

function parseSchedules(body: string) {
  const regex = /Schedule Types:(.+)/g.exec(body);
  if (!regex) {
    return [];
  };
  return regex[1].trim().split(',').map(x => x.trim());
}

function parseDepartment(body: string) {
  const regex = /:(?:.+)[\n\s]+(.+)[\s\n]+Course/g.exec(body);
  if (!regex) {
    return '';
  }
  return regex[1].trim();
}

function parseDescription(body: string) {
  const creditHourRegex = /([\d.]+)\s+(\S+)\s+hours\s+/g.exec(body);
  if (!creditHourRegex) {
    return '';
  }
  return body.substring(0, creditHourRegex.index).trim();
}

function parseCourseAttributes(body: string) {
  const regex = /Course Attributes:(.+)/g.exec(body);
  if (!regex) {
    return [];
  };
  return regex[1].trim().split(',').map(x => x.trim());
}

interface DisplayCoursesCatalogEntry {
  subject: string,
  number: string,
  title: string,
  creditHours: number,
  otherHours: { [type: string]: number }
  levels: string[],
  scheduleTypes: string[],
  department: string,
  courseAttributes: string[],
  description: string,
}

function parseBody(body: string) {
  const { Credit, ...otherHours } = parseHours(body);
  const levels = parseLevels(body);
  const scheduleTypes = parseSchedules(body);
  const department = parseDepartment(body);
  const courseAttributes = parseCourseAttributes(body);
  const description = parseDescription(body);
  const creditHours = Credit;
  return {
    creditHours,
    otherHours,
    levels,
    scheduleTypes,
    department,
    courseAttributes,
    description,
  };
}

function textNodes(node: Node | null | undefined): Node[] {
  let all = [] as Node[];
  for (node = node && node.firstChild; node; node = node.nextSibling) {
    if (node.nodeType == 3) {
      all.push(node);
    }
    else {
      all = all.concat(textNodes(node));
    }
  }
  return all;
}

function parseCatalogEntries(html: string) {
  const { window } = new JSDOM(html);
  const document = window.document;
  const values = Array.from(document.querySelectorAll('.datadisplaytable tr'));

  /**
   * takes the values list and groups them into heading and body
   */
  const groups = values.reduce((groups, headingOrBody: HTMLTableRowElement, index) => {
    const currentGroup = groups[Math.floor(index / 2)] = groups[Math.floor(index / 2)] || {};
    if (index % 2 === 0) {
      currentGroup.heading = headingOrBody;
    } else {
      currentGroup.body = headingOrBody;
    }
    return groups;
  }, [] as { heading: HTMLTableRowElement | undefined, body: HTMLTableRowElement | undefined }[])

  const parsedGroups = groups.map(group => {
    const titleElement = group.heading && group.heading.querySelector('.nttitle a');
    const titleSubjectAndNumber = titleElement && parseTitle(titleElement.innerHTML);

    const bodyElement = group.body && group.body.querySelector('.ntdefault');

    const bodyText = bodyElement && textNodes(bodyElement).map(x => x.textContent).join(' ');
    return {
      title: titleSubjectAndNumber && titleSubjectAndNumber.title,
      subject: titleSubjectAndNumber && titleSubjectAndNumber.subject,
      number: titleSubjectAndNumber && titleSubjectAndNumber.number,
      ...parseBody(bodyText || '')
    };
  });
  return parsedGroups;
}

const parsedHtml = parseCatalogEntries(html);

fs.writeFileSync('data.json', JSON.stringify(parsedHtml));