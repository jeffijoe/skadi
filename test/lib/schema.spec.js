'use strict';
const schemaUtils = require('../../lib/schema');
const createPicker = schemaUtils.createPicker;
const rewriteSchema = schemaUtils.rewriteSchema;
const simpleSchema = require('../_fixtures/simpleSchema');

describe('schema utilities', function() {
  describe('createPicker', function() {
    let picker;
    before(() => {
      picker = createPicker(
        rewriteSchema(simpleSchema)
      );
    });

    it('creates a function that will filter out unwanted properties', function() {
      const source = {
        name: 'Jeff',
        dont: 'include me'
      };
      const picked = picker(source);

      picked.should.deep.equal({ name: 'Jeff' });
      picked.should.not.equal(source);
    });

    it('supports simple arrays', function() {
      const picked = picker({
        tags: ['wat', 'the', 'fuck'],
        cantDoit: 'not today'
      });

      picked.should.deep.equal({ tags: ['wat', 'the', 'fuck'] });
    });

    it('supports object arrays', function() {
      const picked = picker({
        notes: [{ title: 'A New World', lol: 'nope' }],
        cantDoit: 'not today'
      });

      picked.should.deep.equal({ notes: [{ title: 'A New World' }] });
    });

    it('supports additionalProperties:true', function() {
      const src = { settings: { notifications: false, sad: true } };
      const picked = picker(src);

      picked.should.deep.equal(src);
    });
  });

  describe('rewriteSchema', function() {
    it('rewrites all additionalProperties to _additionalProperties', function() {
      const newSchema = rewriteSchema(simpleSchema);

      newSchema.should.not.have.property('additionalProperties');
      newSchema.should.have.property('_additionalProperties');
      newSchema.properties.settings.should.not.have.property('additionalProperties');
      newSchema.properties.settings.should.have.property('_additionalProperties');
    });

    it('supports definitions', function() {
      const newSchema = rewriteSchema({
        type: 'object',
        definitions: {
          deffo: {
            type: 'object',
            additionalProperties: false,
            properties: {
              cool: {
                type: 'string'
              }
            }
          }
        }
      });

      newSchema.should.not.have.property('additionalProperties');
      newSchema.should.not.have.property('_additionalProperties');
      newSchema.definitions.deffo.should.not.have.property('additionalProperties');
      newSchema.definitions.deffo.should.have.property('_additionalProperties');
    });

    it('supports anyOf', function() {
      const newSchema = rewriteSchema({
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              cool: {
                type: 'string'
              }
            }
          },
          {
            type: 'object',
            additionalProperties: true,
            properties: {
              stuff: {
                anyOf: [
                  {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      cool: {
                        type: 'string'
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      });

      newSchema.anyOf[0].should.not.have.property('additionalProperties');
      newSchema.anyOf[0].should.have.property('_additionalProperties');
      newSchema.anyOf[1].should.not.have.property('additionalProperties');
      newSchema.anyOf[1].should.have.property('_additionalProperties');

      newSchema.anyOf[1].properties.stuff.anyOf[0].should.not.have.property('additionalProperties');
      newSchema.anyOf[1].properties.stuff.anyOf[0].should.have.property('_additionalProperties');
    });
  });
});