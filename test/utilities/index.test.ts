import { expect } from 'chai';

import { formEncode, formDecode } from "../../src/utilities/index";

describe('form encoding/decoding', function () {
  it('encodes and decodes objects', function () {
    const someObject = {
      someKey: 'something that should be encoded',
      someOtherKey: 'some other value -- with // slashes and stuff //',
    };

    const encoded = formEncode(someObject);
    const decoded = formDecode(encoded);

    expect(decoded).to.be.deep.equal(someObject);
  });
})