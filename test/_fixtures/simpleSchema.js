'use strict';

module.exports = {
  additionalProperties: false,
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    settings: {
      type: 'object',
      additionalProperties: true,
      properties: {
        notifications: {
          type: 'boolean'
        }
      }
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    notes: {
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