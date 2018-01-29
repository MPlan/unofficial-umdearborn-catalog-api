import { expect } from 'chai';

import { formEncode, formDecode, regularToCamelCase } from "../../src/utilities/index";

describe('utilities', function () {
  it('form encoding/decoding', function () {
    const someObject = {
      someKey: 'something that should be encoded',
      someOtherKey: 'some other value -- with // slashes and stuff //',
    };

    const encoded = formEncode(someObject);
    const decoded = formDecode(encoded);

    expect(decoded).to.be.deep.equal(someObject);
  });
  it('regularToCamelCase', function () {
    const regularString = '  The quick Brown FOX juMps  Over the Lazy dog  ';
    expect(regularToCamelCase(regularString)).to.be.equal('theQuickBrownFoxJumpsOverTheLazyDog');
  });
})