'use strict'
const map = require('lodash/fp/map')
const fromPairs = require('lodash/fp/fromPairs')
const toPairs = require('lodash/fp/toPairs')
const identity = require('lodash/fp/identity')
const compose = require('lodash/fp/compose')
const compact = require('lodash/fp/compact')
const mapValues = require('lodash/fp/mapValues')
const prop = require('lodash/fp/prop')
const rewrite = require('./rewrite')
const setIfExists = require('./setIfExists')

/**
 * Recursively rewrites a JSON schema's additionalProperties to _additionalProperties.
 * This is so the underlying JSON schema library does not throw. We want to use it
 * to sanitize.
 *
 * @param {object} schema
 * The schema to rewrite.
 *
 * @return {object}
 * The rewritten schema.
 */
const rewriteSchema = compose([
  setIfExists('items', (x) => rewriteSchema(prop('items', x))),
  setIfExists('anyOf', (x) => map(rewriteSchema, prop('anyOf', x))),
  setIfExists('allOf', (x) => map(rewriteSchema, prop('allOf', x))),
  setIfExists('oneOf', (x) => map(rewriteSchema, prop('oneOf', x))),
  setIfExists('not', (x) => map(rewriteSchema, prop('not', x))),
  setIfExists('definitions', (x) =>
    mapValues(rewriteSchema, prop('definitions', x))
  ),
  setIfExists('properties', (x) =>
    mapValues(rewriteSchema, prop('properties', x))
  ),
  (obj) =>
    obj.additionalProperties === false
      ? rewrite('additionalProperties', '_additionalProperties', obj)
      : obj,
])

module.exports.rewriteSchema = rewriteSchema

/**
 * Creates a function that will filter out any unwanted properties based on a JSON schema.
 *
 * @param  {object} schema
 * The JSON schema.
 *
 * @param  {string} opts.additionalPropertiesProp
 * The property to look at - defaults to additionalProperties.
 *
 * @return {Function(object)}
 * The picker function.
 */
function createPicker(schema, opts) {
  if (typeof schema === 'string') {
    schema = { type: 'string' }
  }

  opts = opts || {}
  // We want to create a picker, so we can filter out
  // stuff we don't want based on `additionalProperties: false`
  const additionalPropertiesProp =
    opts.additionalPropertiesProp || 'additionalProperties'

  // Arrays are supported, too - we
  // just map over it!
  if (schema.type === 'array') {
    return map(createPicker(schema.items, opts))
  }

  // If the type isn't an object, we just return whatever
  // we were given. This is how we deal with anything
  // not to be recursed on.
  if (schema.type !== 'object') {
    return identity
  }

  const additionalProperties = schema[additionalPropertiesProp] !== false
  // Each property on the source schema is mapped
  // onto to this object, where the value
  // is going to be a new createPicker() function,
  // or the original value.
  // The function is used for recursive descent.
  const pickerMap = fromPairs(
    map(
      (pair) => [pair[0], createPicker(pair[1], opts)],
      pairsFromSchema(schema)
    )
  )

  // Composition looks good.
  return compose(
    fromPairs,
    compact,
    // The mapper function will return
    // an array of [[key, value], undefined],
    // the undefineds we filter out later.
    map((pair) => {
      const key = pair[0]
      const value = pair[1]
      const pick = pickerMap[key]
      if (!pick) {
        // The picker map didn't contain
        // the property, so if we allow additional
        // properties, we just return it here.
        if (additionalProperties) {
          return [key, value]
        }

        return undefined
      }

      // Since it was in the map, we invoke the picker function.
      return [key, pick(value)]
    }),
    toPairs
  )
}

module.exports.createPicker = createPicker

/**
 * Returns [prop, schema] pairs for the specified input.
 * @param {*} schema
 */
function pairsFromSchema(schema) {
  if (!schema) {
    return undefined
  }

  if (Array.isArray(schema)) {
    return Array.prototype.concat.apply([], schema.map(pairsFromSchema))
  }

  return Array.prototype.concat
    .apply(schema.properties ? toPairs(schema.properties) : [], [
      pairsFromSchema(schema.items),
      pairsFromSchema(schema.anyOf),
      pairsFromSchema(schema.oneOf),
      pairsFromSchema(schema.allOf),
    ])
    .filter(identity)
}
