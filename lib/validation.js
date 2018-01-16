'use strict'
const imjv = require('is-my-json-valid')
const schemaUtils = require('./schema')
const ValidationError = require('./ValidationError')
const expandShorthands = require('json-schema-shorthand').default

const rewriteSchema = schemaUtils.rewriteSchema
const createPicker = schemaUtils.createPicker

const EMPTY_STRING = ''
const DATA_REGEX = /^(data\.)/

/**
 * Fixes the errors collection so that "data." is removed from "field".
 *
 * @param  {object[]} errors
 * The errors to fix.
 *
 * @return {object[]}
 * The fixed errors.
 */
const fixErrors = errors =>
  errors.map(err =>
    Object.assign({}, err, {
      field: err.field.replace(DATA_REGEX, EMPTY_STRING)
    })
  )

/**
 * Creates a validator for the given schema.
 *
 * @param  {Object} schema
 * The JSON schema.
 *
 * @param  {Object} opts
 * Optional options to pass to `is-my-json-valid`
 *
 * @return {Function} The validator function.
 */
function createValidator(schema, opts) {
  opts = Object.assign(
    {
      greedy: true,
      verbose: true,
      createError: errors => new ValidationError(errors)
    },
    opts
  )
  schema = rewriteSchema(expandShorthands(schema))
  const validator = imjv(schema, opts)
  const picker = createPicker(schema, {
    additionalPropertiesProp: '_additionalProperties'
  })

  /**
   * The validate function being returned.
   * Uses context under the hood.
   *
   * @param  {object} obj
   * The object to validate.
   *
   * @return {object}
   * The fixed object, if validation succeeds.
   */
  const validate = (obj, preventThrow) => {
    return validate.context(obj).end(preventThrow)
  }

  /**
   * Returns a validation context, used to add more errors and throwing/returning
   * the fixed object when needed.
   *
   * @param  {object} obj
   * The object to validate.
   *
   * @return {object}
   * The resulting object.
   */
  validate.context = obj => {
    validator(obj)
    const errors = validator.errors ? fixErrors(validator.errors) : []
    const result = {
      // Errors array.
      errors,

      // The picker.
      pick: () => picker(obj),

      /**
       * Determines if the context is valid, based on error presence.
       *
       * @return {Boolean}
       */
      valid: () => (result.errors ? result.errors.length === 0 : true),

      /**
       * Ends the validation and throws if unsuccessful, returns
       * the fixed object otherwise.
       *
       * @param {Boolean} preventThrow
       * If true, will not throw the exception, and returns null instead.
       *
       * @return {object}
       * The fixed object.
       */
      end: preventThrow => {
        if (!result.valid()) {
          if (preventThrow) {
            return null
          }

          throw opts.createError(result.errors)
        }

        return picker(obj)
      }
    }

    return result
  }

  return validate
}

module.exports.createValidator = createValidator
