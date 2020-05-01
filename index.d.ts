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

export type ISchemaDef<T> = ISchema<T> | boolean
export type IItemSchemaDef<T> = T extends Array<infer R>
  ? ISchemaDef<R> | ISchemaDef<R>[]
  : never
export type JSONSchemaTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'any'

/**
 * JSON Schema V6
 * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01
 */
export interface ISchema<T> {
  $id?: string
  $ref?: string

  /**
   * Must be strictly greater than 0.
   * A numeric instance is valid only if division by this keyword's value results in an integer.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.1
   */
  multipleOf?: number

  /**
   * Representing an inclusive upper limit for a numeric instance.
   * This keyword validates only if the instance is less than or exactly equal to "maximum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.2
   */
  maximum?: number

  /**
   * Representing an exclusive upper limit for a numeric instance.
   * This keyword validates only if the instance is strictly less than (not equal to) to "exclusiveMaximum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.3
   */
  exclusiveMaximum?: number

  /**
   * Representing an inclusive lower limit for a numeric instance.
   * This keyword validates only if the instance is greater than or exactly equal to "minimum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.4
   */
  minimum?: number

  /**
   * Representing an exclusive lower limit for a numeric instance.
   * This keyword validates only if the instance is strictly greater than (not equal to) to "exclusiveMinimum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.5
   */
  exclusiveMinimum?: number

  /**
   * Must be a non-negative integer.
   * A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.6
   */
  maxLength?: number

  /**
   * Must be a non-negative integer.
   * A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.7
   */
  minLength?: number

  /**
   * Should be a valid regular expression, according to the ECMA 262 regular expression dialect.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.8
   */
  pattern?: string

  /**
   * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
   * Omitting this keyword has the same behavior as an empty schema.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.9
   */
  items?: IItemSchemaDef<T> | IItemSchemaDef<T>[]

  /**
   * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
   * If "items" is an array of schemas, validation succeeds if every instance element
   * at a position greater than the size of "items" validates against "additionalItems".
   * Otherwise, "additionalItems" MUST be ignored, as the "items" schema
   * (possibly the default value of an empty schema) is applied to all elements.
   * Omitting this keyword has the same behavior as an empty schema.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.10
   */
  additionalItems?: IItemSchemaDef<T[any]>

  /**
   * Must be a non-negative integer.
   * An array instance is valid against "maxItems" if its size is less than, or equal to, the value of this keyword.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.11
   */
  maxItems?: number

  /**
   * Must be a non-negative integer.
   * An array instance is valid against "maxItems" if its size is greater than, or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.12
   */
  minItems?: number

  /**
   * If this keyword has boolean value false, the instance validates successfully.
   * If it has boolean value true, the instance validates successfully if all of its elements are unique.
   * Omitting this keyword has the same behavior as a value of false.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.13
   */
  uniqueItems?: boolean

  /**
   * An array instance is valid against "contains" if at least one of its elements is valid against the given schema.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.14
   */
  contains?: IItemSchemaDef<T[any]>

  /**
   * Must be a non-negative integer.
   * An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.15
   */
  maxProperties?: number

  /**
   * Must be a non-negative integer.
   * An object instance is valid against "maxProperties" if its number of properties is greater than,
   * or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.16
   */
  minProperties?: number

  /**
   * Elements of this array must be unique.
   * An object instance is valid against this keyword if every item in the array is the name of a property in the instance.
   * Omitting this keyword has the same behavior as an empty array.
   *
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.17
   */
  required?: Array<keyof T>

  /**
   * This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
   * Validation succeeds if, for each name that appears in both the instance and as a name within this keyword's value,
   * the child instance for that name successfully validates against the corresponding schema.
   * Omitting this keyword has the same behavior as an empty object.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.18
   */
  properties?: { [K in keyof T]?: string | ISchema<T[K]> }

  /**
   * This attribute defines a schema for all properties that are not explicitly defined in an object type definition.
   * If specified, the value MUST be a schema or a boolean.
   * If false is provided, no additional properties are allowed beyond the properties defined in the schema.
   * The default value is an empty schema which allows any value for additional properties.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.20
   */
  additionalProperties?: ISchema<any>

  /**
   * This provides an enumeration of all possible values that are valid
   * for the instance property. This MUST be an array, and each item in
   * the array represents a possible value for the instance value. If
   * this attribute is defined, the instance value MUST be one of the
   * values in the array in order for the schema to be valid.
   *
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.23
   */
  enum?: T[]

  /**
   * More readible form of a one-element "enum"
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.24
   */
  const?: T

  /**
   * A single type, or a union of simple types
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.25
   */
  type?: JSONSchemaTypeName | JSONSchemaTypeName[]

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.26
   */
  allOf?: ISchema<T>[]

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.27
   */
  anyOf?: ISchema<T>[]

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.28
   */
  oneOf?: ISchema<T>[]

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.29
   */
  not?: ISchema<any>

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-7.1
   */
  definitions?: {
    [k: string]: ISchema<any>
  }

  /**
   * This attribute is a string that provides a short description of the instance property.
   *
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-7.2
   */
  title?: string

  /**
   * This attribute is a string that provides a full description of the of purpose the instance property.
   *
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-7.2
   */
  description?: string

  /**
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-8
   */
  format?: string
}
