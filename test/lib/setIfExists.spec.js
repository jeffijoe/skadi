'use strict';
const setIfExists = require('../../lib/setIfExists');

describe('setIfExists', function() {
  describe('if the property exists on the source', function() {
    it('returns a new object with the executed fns retval set on the property', function() {
      const src = { name: 'Jeff' };
      const result = setIfExists(
        'name',
        x => x.name.length,
        src
      );

      result.should.not.equal(src);
      result.should.deep.equal({ name: 4 });
    });
  });

  describe('if the property does not exist on the source', function() {
    it('returns the original', function() {
      const src = { username: 'jeffijoe' };
      const result = setIfExists(
        'name',
        x => x.name.length,
        src
      );

      result.should.equal(src);
    });
  });
});