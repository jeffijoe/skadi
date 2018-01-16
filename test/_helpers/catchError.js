'use strict'

/**
 * Catches an error when executing the given function, and
 * returns it.
 */
function catchError(fn) {
  try {
    fn()
    return undefined
  } catch (err) {
    return err
  }
}

module.exports = catchError
