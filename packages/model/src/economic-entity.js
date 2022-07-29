import {EconomicEntityType} from './economic-entity-type.js';
import {validString} from './helpers.js';

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
    this.name = name;
    this.type = type;
  }

  /**
   * Determine if an economic entity equals another.
   * @param {EconomicEntity} target
   * @return {Boolean} True if equivalent. False otherwise.
   */
  equals(target) {
    return (
      validEconomicEntities([this, target]) &&
      this.name === target.name &&
      this.type === target.type
    );
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
   * Get the string representation of the economic entity.
   * @return {String} String representation of the economic entity.
   */
  toString() {
    return `economic entity: type ${this.type}, name ${this.name}`;
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
 * Check if an economic entity is valid.
 * @param {EconomicEntity} economicEntity
 * @return {Boolean} True if valid. False otherwise.
 */
const validEconomicEntity = (economicEntity) => {
  return (
    validString(economicEntity.name) &&
    EconomicEntityType.valid(economicEntity.type) &&
    typeof economicEntity.valid === 'function' &&
    economicEntity.valid()
  );
};

/**
 * Check if economic entities are valid.
 * @param {Array<EconomicEntity>} economicEntities Economic entities to validate.
 * @return {Boolean} True if the economic entities are valid. False otherwise.
 */
const validEconomicEntities = (economicEntities) => {
  for (const economicEntity of economicEntities) {
    if (!validEconomicEntity(economicEntity)) {
      throw new Error(
        `Invalid economic entity: type ${economicEntity.type}, name ${economicEntity.name}`
      );
    }
  }

  return true;
};

export {EconomicEntity, validEconomicEntities, objectifyEconomicEntities};
