import { JSDOM } from 'jsdom';
import { Term } from '../models/term';

export function parseTerms(html: string) {
  const document = new JSDOM(html).window.document;
  const termsSelect = document.querySelector('#term_input_id') as HTMLSelectElement | null;
  if (!termsSelect) { throw new Error('No term select box in catalog terms HTML.'); }
  const termsOptions = Array.from(termsSelect.querySelectorAll('option')) as HTMLOptionElement[];
  const terms = (termsOptions
    .filter(option => {
      return !!/(\w*) (\d*)/.exec(option.text);
    })
    .map(option => {
      const [rawSeason, rawYear] = option.text.split(' ');

      const term: Term = {
        code: option.value,
        season: rawSeason.toLowerCase().trim(),
        year: parseInt(rawYear.trim()),
      };

      return term;
    })
  );
  return terms;
}