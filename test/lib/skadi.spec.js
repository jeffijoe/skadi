'use strict'
const skadi = require('../../lib/skadi')

describe('skadi', function() {
  it('exists', function() {
    expect(skadi).to.exist
  })

  it('exports the public API', function() {
    expect(skadi.createValidator).to.be.a('function')
    expect(skadi.createPicker).to.be.a('function')
    expect(skadi.ValidationError).to.be.a('function')
  })
})
