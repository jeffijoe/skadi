'use strict'
const has = require('lodash/fp/has')
const set = require('lodash/fp/set')
const curry = require('lodash/fp/curry')

/**
 * If the given property exists on the specified object,
 * it will be set to the value returned by invoking the specified
 * function, else the original object is returned.
 *
 * @param {string} propName
 * The property name.
 *
 * @param {Function(src)} fn
 * The function to execute. Takes the source as the first parameter,
 * returns the value to set.
 *
 * @return {object}
 * The new object is set, otherwise the original.
 */
const setIfExists = curry(
  (propName, fn, src) => (
    has(propName, src)
      ? set(propName, fn(src), src)
      : src
  )
)

module.exports = setIfExists
