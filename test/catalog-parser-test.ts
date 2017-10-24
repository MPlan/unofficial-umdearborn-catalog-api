import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { parseCatalogEntriesHtml } from '../src/parsers/catalog-parser';
const exampleHtml = fs.readFileSync(
  path.resolve(__dirname, './example-pages/course-list.html')
).toString();

describe('Catalog entries parser', function () {
  it('parses the example with the correct length', function () {
    const catalogEntries = parseCatalogEntriesHtml(exampleHtml);
    expect(catalogEntries.length).to.be.equal(136);
  });
});