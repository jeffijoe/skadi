'use strict'

const createValidator = require('../../lib/validation').createValidator
const ValidationError = require('../../lib/ValidationError')
const catchError = require('../_helpers/catchError')
const simpleSchema = require('../_fixtures/simpleSchema')

describe('validation utilities', function () {
  describe('createValidator', function () {
    it('returns a validator function', function () {
      createValidator(simpleSchema).should.be.a.function
    })

    describe('validator', function () {
      let validator
      before(function () {
        validator = createValidator(simpleSchema)
      })

      it('throws a ValidationError when there are errors', function () {
        const err = catchError(() => validator({ name: 123 }))
        expect(err).to.be.an.instanceOf(ValidationError)
        err.errors.length.should.not.equal(0)
        err.errors[0].field.should.equal('name')
      })

      it('returns the picked object when all is good', function () {
        const input = { name: 'nice', other: 'stuff' }
        const result = validator(input)
        result.should.not.equal(input)
        result.should.deep.equal({ name: 'nice' })
      })

      describe('context', function () {
        it('exists', function () {
          validator = createValidator(simpleSchema)
          expect(validator.context).to.exist
        })

        it('creates a context with a valid and end function, as well as errors', function () {
          validator = createValidator(simpleSchema)
          expect(validator.context({}).end).to.exist.and.be.a.function
          expect(validator.context({}).valid).to.exist.and.be.a.function

          const errors = validator.context({ name: 123 }).errors
          expect(errors).to.exist.and.be.an.array

          errors.length.should.not.equal(0)
          errors[0].field.should.equal('name')
        })

        describe('greedy mode', function () {
          it('is on by default', function () {
            const errors = createValidator({
              type: 'object',
              properties: {
                name: 'string',
                age: 'number'
              },
              required: ['name', 'age']
            }).context({ name: 123 }).errors
            errors.length.should.equal(1)
          })

          it('can be turned off', function () {
            const errors = createValidator({
              type: 'object',
              properties: {
                name: 'string',
                age: 'number'
              },
              required: ['name', 'age']
            }, { greedy: false }).context({ name: 123 }).errors

            errors.length.should.equal(1)
          })
        })

        describe('valid', function () {
          it('returns true if valid', function () {
            const ctx = validator.context({ name: 'Jeff' })
            ctx.valid().should.be.true
          })

          it('returns false if invalid', function () {
            const ctx = validator.context({ name: 123 })
            ctx.valid().should.be.false
          })

          it('returns true when errors is not an array', function () {
            const ctx = validator.context({ name: 123 })
            delete ctx.errors
            ctx.valid().should.be.true
          })
        })

        describe('picker', function () {
          it('returns the picked object which is not the same instance', function () {
            const input = { name: 'Test' }
            const ctx = validator.context(input)
            const picked = ctx.pick()
            picked.should.not.equal(input)
            picked.should.deep.equal({ name: 'Test' })
          })
        })

        describe('end', function () {
          it('returns null when preventThrow is true', function () {
            const ctx = validator.context({ name: 123 })
            expect(ctx.end(true)).to.be.null
          })

          it('throws a ValidationError', function () {
            const ctx = validator.context({ name: 123 })
            const err = catchError(() => ctx.end())
            err.should.be.an.instanceOf(ValidationError)
            err.errors[0].field.should.equal('name')
          })
        })
      })
    })
  })
})
