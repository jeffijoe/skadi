'use strict';
/**
 * Skadi Example usage
 */

// ===== SETUP AREA ==========

const skadi = require('../lib/skadi');
const createValidator = skadi.createValidator;

// Our simple schema. See http://json-schema.org/ for details.
const schema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    age: {
      type: 'number'
    },
    whateverOtherData: {
      type: 'object',
      additionalProperties: true,
      properties: {
        knownThing: {
          type: 'number'
        }
      }
    },
    // We can get fancy with arrays of objects, too.
    posts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: {
            type: 'string'
          },
          likes: {
            type: 'number'
          }
        }
      }
    }
  }
};

// Create a validator for the specified schema.
const validator = createValidator(schema);

// ===== USAGE AREA ==========

// This is our input that we will modify and run through
// the validator.
const input = {
};


// Debugging helper..
const run = (msg) => {
  // We create a validation context that
  // we can use to check validity, add extra errors,
  // and sanitize the input.
  const result = validator.context(input);

  console.log('\r\n\r\n');
  console.log('-----------------------');
  console.log(msg);
  console.log('-----------------------');

  // The result has an errors array. Feel free to add your own errors in the form of { field, message }
  console.log('Errors:', result.errors);
  // .valid() basically checks the length of the errors array.
  console.log('Valid:', result.valid());
  // .pick() will create a new object based on the one pased in, which will
  // strip out properties where they are not expected.
  console.log('Sanitized:\r\n', result.pick());
  console.log('=======================');
};

run('Nothing at all.');

input.name = 'Jeff';
run('Now has a name, should be valid');

input.somethingNotInTheSchema = 'such a smart attack';
run('Extra property, should be valid, but only contain name');

input.age = 'over 9000';
run('age as a string is bad');

input.age = 9001;
run('age as a number is good');

input.whateverOtherData = {
  blueBurn: 'is good stuff'
};
run('Additional properties are allowed in whateverOtherData');

input.whateverOtherData.knownThing = 'lol no number for you';
run('But we can still be strict about known things');

input.whateverOtherData.knownThing = 1337;
run('All good.');

input.posts = [{
  title: 'Hello world!',
  likes: 'a lot'
}];
run('We can validate arrays of.. anything, really');

input.posts[0].likes = 29;
run('I think thats kinda nice.');