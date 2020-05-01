'use strict'

module.exports = {
  additionalProperties: false,
  type: 'object',
  properties: {
    name: 'string',
    settings: {
      type: 'object',
      additionalProperties: true,
      properties: {
        notifications: {
          type: 'boolean',
        },
      },
    },
    tags: {
      array: 'string',
    },
    notes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: 'string',
          likes: 'number',
        },
      },
    },
  },
}
