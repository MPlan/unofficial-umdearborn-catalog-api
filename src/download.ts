const url = 'https://selfservice.umd.umich.edu/BANP/bwckctlg.p_display_courses';

const subjectCodes = [
  'ACC',
  'AAAS',
  'AMST',
  'ANTH',
  'MAPP',
  'AAST',
  'ARBC',
  'ART',
  'ARTH',
  'ASTR',
  'AENG',
  'ASE',
  'BBS',
  'BSCI',
  'BCHM',
  'BENG',
  'BIOL',
  'BA',
  'BE',
  'BI',
  'BPS',
  'CHEM',
  'CLS',
  'CIVE',
  'COMM',
  'CHE',
  'COML',
  'CCM',
  'CIS',
  'CBA',
  'CELP',
  'CEM',
  'CHST',
  'CPSY',
  'CRJ',
  'DS',
  'ECON',
  'EDA',
  'EDB',
  'EDC',
  'EDD',
  'EDF',
  'EDK',
  'EDM',
  'EDN',
  'EDT',
  'EDMA',
  'ECE',
  'ESE',
  'ENGR',
  'EMGT',
  'ENGL',
  'COMP',
  'ELP',
  'ENT',
  'ESCI',
  'ENST',
  'EXPS',
  'FIN',
  'FREN',
  'GEOG',
  'GEOL',
  'GER',
  'GLOC',
  'HSED',
  'HHS',
  'HIT',
  'HPS',
  'HIST',
  'MHIS',
  'HRM',
  'HUM',
  'IMSE',
  'ISE',
  'ITM',
  'IB',
  'JPN',
  'JASS',
  'LAT',
  'LE',
  'LIBS',
  'LIBR',
  'LING',
  'LGM',
  'MIS',
  'MKT',
  'MATH',
  'ME',
  'MICR',
  'MILS',
  'MCL',
  'MTHY',
  'NSCI',
  'OM',
  'OB',
  'PHIL',
  'PHYS',
  'POL',
  'PDED',
  'PSYC',
  'PADM',
  'PPOL',
  'RELS',
  'STS',
  'SSCI',
  'SWK',
  'SOC',
  'SPAN',
  'SPEE',
  'STAT',
  'TAX',
  'URS',
  'WGST'
].slice(100);

function bodyTemplate(subjectCode: string) {
  return `term_in=201820&call_proc_in=bwckctlg.p_disp_dyn_ctlg&sel_subj=dummy&sel_levl=dummy&sel_schd=dummy&sel_coll=dummy&sel_divs=dummy&sel_dept=dummy&sel_attr=dummy&sel_subj=${subjectCode}&sel_crse_strt=&sel_crse_end=&sel_title=&sel_levl=%25&sel_schd=%25&sel_coll=%25&sel_divs=%25&sel_dept=%25&sel_from_cred=&sel_to_cred=&sel_attr=%25`;
}
import * as got from 'got';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import { parseCatalogEntriesHtml, CatalogEntry } from './parsers/catalog-parser';

function extractBody(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;
  const element = document.querySelector('.ntdefault');
  if (!element) {
    return undefined;
  }
  return element.innerHTML;
}

async function fetchCatalogEntries(subjectCode: string) {
  try {
    const body = bodyTemplate(subjectCode);
    const response = await got.post(url, {
      body,
      ciphers: 'ALL',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    } as any);
    return parseCatalogEntriesHtml(response.body);
  } catch (e) {
    return [];
  }
}

function timer(milliseconds: number) {
  return new Promise<undefined>((resolve, reject) => {
    setTimeout(() => resolve(undefined), milliseconds);
  });
}
let catent: number;
async function getCourseDetail(href: string) {
  const responseOrUndefined = await Promise.race([
    got.get(`https://selfservice.umd.umich.edu${href}`, {
      ciphers: 'ALL'
    } as any),
    timer(60 * 1000) // minute timeout
  ]);

  progress++;
  console.log(progress * 100 / catent + '%')

  if (!responseOrUndefined) {
    console.log(`${href} failed. Retrying...`);
    // retry
    const secondTry = await Promise.race([
      got.get(`https://selfservice.umd.umich.edu${href}`, {
        ciphers: 'ALL'
      } as any),
      timer(60 * 1000) // minute timeout
    ]);

    if (secondTry) {
      return secondTry.body.toString() as string;
    }
    return undefined;
  }

  return responseOrUndefined.body.toString() as string;
}

let progress = 0;
let cat = 0;
async function main() {
  console.log('getting all catalog entries...');
  const catalogEntriesOfCatalogEntries = await Promise.all(subjectCodes.map(async code => {
    const entry = await fetchCatalogEntries(code);
    cat++;
    console.log((cat * 100 / subjectCodes.length).toFixed() + '%');
    return entry;
  }));
  console.log('got all catalog entries');

  // flatten the double array
  const catalogEntries = catalogEntriesOfCatalogEntries.reduce((flattened, next) =>
    [...flattened, ...next], [] as CatalogEntry[]
  );
  catent = catalogEntries.length;

  const requests = catalogEntries.map(async (entry, index) => {
    try {
      const detailResponse = await getCourseDetail(entry.href);

      if (!detailResponse) {
        return '';
      }

      return extractBody(detailResponse);
    } catch (e) {
      return '';
    }
  });

  console.log('starting full download...')
  const bodies = await Promise.all(requests);
  console.log('finished downloading!!')
  const bodiesText = bodies.filter(body => !!body).map(body => `====START====${body}====END====`).join('\n');
  console.log('writing...');
  fs.writeFileSync('bodies100.txt', bodiesText);
  console.log('wrote.');
}


main();

// console.log(subjectCodes.length)