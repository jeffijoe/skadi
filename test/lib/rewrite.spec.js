'use strict'
const rewrite = require('../../lib/rewrite')

describe('rewrite', function () {
  it('rewrites object properties correctly', function () {
    rewrite('name', '_name', { name: 'Jeff' }).should.deep.equal({
      _name: 'Jeff',
    })
  })

  it('does not write value if it does not exist', function () {
    rewrite('name', '_name', { username: 'Jeff' }).should.deep.equal({
      username: 'Jeff',
    })
  })
})
