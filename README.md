# skadi

[![npm version](https://badge.fury.io/js/skadi.svg)](https://badge.fury.io/js/skadi)
[![Dependency Status](https://david-dm.org/jeffijoe/skadi.svg)](https://david-dm.org/jeffijoe/skadi)
[![devDependency Status](https://david-dm.org/jeffijoe/skadi/dev-status.svg)](https://david-dm.org/jeffijoe/skadi#info=devDependencies)
[![Build Status](https://travis-ci.org/jeffijoe/skadi.svg?branch=master)](https://travis-ci.org/jeffijoe/skadi)
[![Coverage Status](https://coveralls.io/repos/github/jeffijoe/skadi/badge.svg?branch=master)](https://coveralls.io/github/jeffijoe/skadi?branch=master)
[![Code Climate](https://codeclimate.com/github/jeffijoe/skadi/badges/gpa.svg)](https://codeclimate.com/github/jeffijoe/skadi)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A simple object validator/sanitizer based on `is-my-json-valid`.

# Installation

```bash
npm install skadi --save
```

# Usage

```javascript
// Import
const { createValidator, ValidationError } = require('skadi')

// Create a validator using a JSON-schema.
const myValidator = createValidator({
  type: 'object',
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      required: true
    }
  }
})

// Use it
const input = {
  name: 'Test',
  otherStuffThatIsNotRelevant: 'hehe'
}

const result = myValidator(input)
// << { name: 'Test' }
```

When used like above, validation errors will throw.

```javascript
try {
  myValidator({ anInvalid: 'object', because: 'it has no name' })
} catch (err) {
  console.log(err instanceof ValidationError) // << true
  console.log(err.errors) // << [{ field: 'name', message: 'is required' }]
}

```

Alternative usage:

```javascript
const context = myValidator.context({ })
console.log(context.valid()) // << false
console.log(context.errors) // << [{ field: 'name', message: 'is required' }]

const anotherContext = myValidator.context({ name: 'Skadi', other: 'stuff' })
console.log(anotherContext.valid()) // << true
console.log(anotherContext.pick()) // << { name: 'Skadi' }

// We can add errors manually..
anotherContext.errors.push({ field: 'name', message: 'Too cool, man' })
console.log(anotherContext.valid()) // << false
```

# Use Case: custom, async validation.

Because you can add errors manually, custom validation becomes easy (JSON-schema does not allow this).

Here's an example that makes the validator async.

```javascript
// Factory function that returns a validator.
// It takes a db so we can look up a user.
function createMyAwesomeValidator(db) {
  const validator = createValidator({
    type: 'object',
    properties: {
      username: {
        type: 'string',
        required: true
      }
    }
  })

  return (objToValidate) => {
    const context = validator.context(objToValidate)

    // Check if username is taken. This is async.
    return db.users.findWhere({ username: objToValidate.username })
      .then((user) => {
        if (!user) {
          context.errors.push({
            field: 'username',
            message: 'This username is taken!'
          })
        }

        // .end() will do the same as calling
        // validator(obj) directly: sanitize and return the object
        // if successful, throw if not.
        return context.end()
      })
  }
}

// Create our validator..
const myAwesomeValidator = createMyAwesomeValidator(someDbModule)
myAwesomeValidator({ username: 'Skadi' })
  .then(user => {
    // Success! We now have a sanitized user.
  })
  .catch(err => {
    // Could be a validation error.
    console.log(err instanceof ValidationError)
  })
```

# Why not just use `validator.filter` from `is-my-json-valid`?

Because it mutates the object rather than returning a new one.

# Examples

Check the `example/` directory, there's an `index.js` that you can run with `node example/index.js`.

# Top-level API

The `skadi` object exports 3 things:

* `createValidator`: the meat of the package.
* `createPicker`: used internally, but could be useful to you.
* `ValidationError`: thrown when you've got too much confidence.

## `createValidator`

Given a JSON-schema, will create a validator function.

`additionalProperties` in JSON-schema means that validation should fail, but Skadi will rewrite the schema so it won't - instead, we filter out unwanted properties after validating. You don't really have to understand this.

```javascript
const myValidator = createValidator(...)

// This...
myValidator({ some: 'object' })

// Is the *exact same* as...
myValidator.context({ some: 'object' }).end()
```

## `createPicker`

Given a JSON-schema, will create a picker function used to filter out
unwanted properties. Used internally in `createValidator`.

The function returned takes an object to pick from, and returns a new object
with the unwanted properties filtered out.

```javascript
const myPicker = skadi.createPicker({
  additionalProperties: false,
  properties: {
    name: {
      type: 'string'
    }
  }
})

myPicker({ name: 'Skadi', other: 'stuff' })
// << { name: 'Skadi' }
```

## `ValidationError`

Thrown when using `validator()` or `validator.context({}).end()`.

Contains an `errors` array.

# Validation Context object

When using `validator.context(obj)`, a validation context is returned. This is what you get:

* `errors`: An array of `{ field, message }`. You can push and pop from it as you see fit. See the async validation use case for an example of how/why you'd want to do this.
* `valid()`: Very simply checks the length of `errors`, and returns `true` if there are none, and `false` when there are errors. Does not throw.
* `pick()`: Returns a sanitized version of the object passed to `context()`.
* `end()`: If `valid()` returns false, will throw a `ValidationError` which will contain the errors array. If everything is smooth, returns a sanitized object (using `pick()`).

# Changelog

* 1.1.2
  - Added support for `allOf`, `oneOf` and `not` picking.
* 1.1.1
  - Make it actually be greedy by default, dammit.
* 1.1.0
  - Added support for passing options to `is-my-json-valid`.
  - Greedy mode on by default.
* 1.0.0
  - Added support for JSON Schema Shorthands.
  - Switched to StandardJS style guide.
* 0.2.0
  - First real release.

# Author

Jeff Hansen - [@Jeffijoe](https://twitter.com/Jeffijoe)
