'use strict'

/**
 * Thrown when validation fails.
 */
class ValidationError extends Error {
  /**
   * Constructs the error.
   *
   * @param  {object[]} errors
   * The array of errors.
   */
  constructor (errors) {
    super('Validation errors occured.')
    this.errors = errors
  }
}

module.exports = ValidationError
