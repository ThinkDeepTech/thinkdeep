import {EconomicEntityType} from './economic-entity-type.js';
import {validString} from './string.js';

/**
 * Economic entity object.
 */
class EconomicEntity {
  /**
   * Constructor.
   * @param {String} name Name of the economic entity.
   * @param {String} type Type of the economic entity.
   */
  constructor(name, type) {
    this._name = name;
    this._type = type;
  }

  /**
   * Get the name.
   */
  get name() {
    return this._name;
  }

  /**
   * Get the type.
   */
  get type() {
    return this._type;
  }

  /**
   * Convert entity type to a plain javascript object.
   * @return {Object} Entity type represented as plain object.
   */
  toObject() {
    return Object.freeze({
      name: this.name,
      type: this.type,
    });
  }

  /**
   * Check whether the economic entity type is valid.
   * @return {Boolean} True if valid. False otherwise.
   */
  valid() {
    return validString(this.name) && EconomicEntityType.valid(this.type);
  }

  /**
   * Get the graphql type definition string for a graphql schema.
   * @return {String} The type definition.
   */
  graphQLTypeDefinition() {
    return `
            type ${this.graphQLType()} {
                name: String!
                type: ${EconomicEntityType.graphQLType()}!
            }
        `;
  }

  /**
   * Get the graphql input type definition string for a graphql schema.
   * @return {String} The type definition.
   */
  graphQLInputTypeDefinition() {
    return `

            input ${this.graphQLInputType()} {
                name: String!
                type: ${EconomicEntityType.graphQLType()}!
            }
        `;
  }

  /**
   * Get the graphql type name string for a graphql schema.
   * @return {String} The type name.
   */
  graphQLType() {
    return 'EconomicEntity';
  }

  /**
   * Get the graphql input type name for a graphql schema.
   * @return {String} The input type name.
   */
  graphQLInputType() {
    return `${this.graphQLType()}Input`;
  }

  /**
   * Get the graphql dependency type definitions for the graphql types.
   * @return {String} GraphQL dependency type definitions or ''.
   */
  graphQLDependencyTypeDefinitions() {
    return EconomicEntityType.graphQLTypeDefinition();
  }
}

/**
 * Convert economic entities to objects.
 * @param {Array<EconomicEntity>} economicEntities
 * @return {Array<Object>} Economic entities converted to objects.
 */
const objectifyEconomicEntities = (economicEntities) => {
  if (!validEconomicEntities(economicEntities)) {
    throw new Error(`Economic entities provided were invalid`);
  }

  const objects = [];
  for (const economicEntity of economicEntities) {
    objects.push(economicEntity.toObject());
  }

  return objects;
};

/**
 * Check if economic entities are valid.
 * @param {Array<EconomicEntity>} economicEntities Economic entities to validate.
 * @return {Boolean} True if the economic entities are valid. False otherwise.
 */
const validEconomicEntities = (economicEntities) => {
  for (const economicEntity of economicEntities) {
    if (!economicEntity.valid || !economicEntity.valid()) {
      throw new Error(`An invalid economic entity was received.`);
    }
  }

  return true;
};

export {EconomicEntity, validEconomicEntities, objectifyEconomicEntities};
