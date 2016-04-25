'use strict';
const omit = require('lodash/fp/omit');
const set = require('lodash/fp/set');
const prop = require('lodash/fp/prop');
const curry = require('lodash/fp/curry');
const compose = require('lodash/fp/compose');
const has = require('lodash/fp/has');

/**
 * Rewrites property names.
 *
 * @param  {string} from
 * The property to read from and delete.
 *
 * @param {string} to
 * The property to write to.
 *
 * @return {object}
 * Rewritten object
 */
const rewrite = curry(
  (from, to, src) => (
    has(from, src)
      ? compose(
          omit(from),
          set(to, prop(from, src))
        )(src)
      : src
  )
);

module.exports = rewrite;