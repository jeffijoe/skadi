import { createValidator, createPicker, ValidationError } from '../../'

createValidator(
  {},
  {
    additionalPropertiesProp: 'additionalProperties',
  }
)

const v = createValidator({})
const picker = createPicker<{ hello: string }>(
  {},
  { additionalPropertiesProp: 'hello' }
)
picker({ hello: 'world' }).hello

v({ hello: 'world' })
v.context({ hello: 'world' }).errors[0].message
v.context({ hello: 'world' }).valid()
v.context({ hello: 'world' }).pick()

const err = new ValidationError()
err.errors[0].message
err.errors[0].field

interface TypeToValidate {
  hello: string
  world: number
  nested: {
    yeah: string
  }
  array: Array<{ wee: string; woo: number }>
  enumz: 'one' | 'two'
  one_value_only: 'one'
}

createValidator<TypeToValidate>(
  {
    properties: {
      hello: 'string',
      world: 'number',
      nested: {
        properties: {
          yeah: 'string',
        },
      },
      array: {
        items: {
          properties: {
            wee: 'string',
            woo: 'number',
          },
        },
      },
      enumz: {
        enum: ['one', 'two'],
      },
      one_value_only: {
        const: 'one',
      },
    },
  },
  {
    createError: (errors) => new Error(errors.map((e) => e.message).join(',')),
  }
)
