/**
 * Creates a validator.
 *
 * @param  {any} schema
 * The JSON-Schema to use
 *
 * @param  {any} opts
 * Options passed to `is-my-json-valid`.
 *
 * @return {IValidator}
 */
export function createValidator<T>(
  schema: ISchema<T>,
  opts?: IValidatorOptions
): IValidator<T>

export interface IValidatorOptions {
  [key: string]: any
  createError?: (errors: Array<IValidationError>) => Error
}

/**
 * Creates a picker function based on a JSON Schema.
 * Copies and strips out additional properties on the input
 * if the Schema says to do so.
 * @type {any}
 */
export function createPicker<T>(
  schema: any,
  opts?: ICreatePickerOptions
): Picker<T>

/**
 * Options for `createPicker`.
 */
export interface ICreatePickerOptions {
  /**
   * What property should we look at to determine if additional properties
   * should be stripped out or not?
   * Default is `additionalProperties`.
   *
   * @type {string}
   */
  additionalPropertiesProp?: string
}

/**
 * Picker function.
 */
export type Picker<T> = (input: T) => T

/**
 * Validator.
 */
export interface IValidator<T> {
  /**
   * Validates the given object and returns a "clean" copy of it
   * based on the schema. Throws a `ValidationError` if invalid.
   * @type {T}
   */
  (input: T, preventThrow?: boolean): T | never
  /**
   * Creates a validation context.
   */
  context(input: T): IValidationContext<T>
}

/**
 * Validation context.
 */
export interface IValidationContext<T> {
  /**
   * The errors. You can modify it as you please.
   * It's emptyness is what determines `valid()`.
   *
   * @type {Array<IValidationError>}
   */
  errors: Array<IValidationError>

  /**
   * Returns a cleaned-up copy of the object based on the schema.
   * @return {T}
   */
  pick(): T

  /**
   * Determines if the context is valid.
   */
  valid(): boolean

  /**
   * Ends the context, throws `ValidationError` if `errors` is not empty.
   *
   * @param  {boolean} preventThrow
   * Prevents throwing an error, returns `null` if invalid.
   *
   * @return {T}
   */
  end(preventThrow?: boolean): T | null | never
}

/**
 * A validation error.
 */
export interface IValidationError {
  /**
   * The field on the object that has a validation error.
   * @type {string}
   */
  field: string
  /**
   * A validation error message.
   * @type {string}
   */
  message: string
}

/**
 * Thrown when invalid.
 */
export class ValidationError extends Error {
  /**
   * The errors.
   * @type {Array<IValidationError>}
   */
  errors: Array<IValidationError>
}

/**
 * Primitive schema types.
 */
export type SchemaPrimitiveType = number | boolean | string | null

/**
 * Schema definition.
 */
export interface ISchema<T> {
  $ref?: string
  description?: string
  allOf?: ISchema<T>[]
  oneOf?: ISchema<T>[]
  anyOf?: ISchema<T>[]
  title?: string
  type?: string | string[]
  definitions?: { [key: string]: any }
  format?: string
  items?: ISchema<T[any]> | ISchema<T[any]>[]
  minItems?: number
  additionalItems?: {
    anyOf: ISchema<T>[]
  }
  enum?: T[]
  default?: SchemaPrimitiveType | Partial<T>
  additionalProperties?: ISchema<T> | boolean
  required?: boolean | string[]
  propertyOrder?: string[]
  properties?: { [K in keyof T]?: string | ISchema<T[K]> }
  defaultProperties?: string[]
  typeof?: 'function'
}
