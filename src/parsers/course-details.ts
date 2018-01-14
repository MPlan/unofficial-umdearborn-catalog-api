import { JSDOM } from 'jsdom';

export function parseDescription(html: string) {
  const match = /<br>\s*[\s\S]*hours/.exec(html);
  if (!match) {
    throw new Error('Could not parse description. Regex match failed.');
  }
  const htmlDescriptionSubstring = html.substring(0, match.index);
  const { window } = new JSDOM(
    `<div id="__description_wrapper__">${htmlDescriptionSubstring}</div>`
  );
  const { document } = window;
  const descriptionDiv = document.querySelector('#__description_wrapper__');
  if (!descriptionDiv) {
    throw new Error('Could not parse description. Failed to grab description div.');
  }
  const description = descriptionDiv.textContent;
  if (description === null) {
    throw new Error('Could not parse description. Failed to grab textContent from div.');
  }
  return description.trim();
}

export function parseCourseDetail(html: string) {

}