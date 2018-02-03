import * as UmdearbornCatalog from '../';
import { expect } from 'chai';

describe('library', function () {
  it(`loads the modules as a library`, function () {
    expect(UmdearbornCatalog).to.not.be.undefined;
    expect(typeof UmdearbornCatalog.parseScheduleDetail === 'function').to.be.true;
    expect(typeof UmdearbornCatalog.fetchCourseDetail === 'function').to.be.true;
  })
});
