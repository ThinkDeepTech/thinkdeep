import {EconomicSectorType} from './economic-sector-type.js';

/**
 * Economic sector.
 */
class EconomicSector {
  /**
   * Constructor.
   * @param {String} type Type of the economic entity.
   */
  constructor(type) {
    if (!EconomicSectorType.valid(type)) {
      throw new Error(`Type ${type} is not valid.`);
    }

    this.type = type;
  }

  /**
   * Determine if the target and subject are equivalent.
   * @param {EconomicEntity} target
   * @return {Boolean} True if equivalent. False otherwise.
   */
  equals(target) {
    return validEconomicSectors([this, target]) && this.type === target.type;
  }

  /**
   * Convert sector to a plain javascript object.
   * @return {Object} Sector represented as plain object.
   */
  toObject() {
    return Object.freeze({
      type: this.type,
    });
  }

  /**
   * Get the string representation of the object.
   * @return {String} String representation of the object.
   */
  toString() {
    return JSON.stringify(this);
  }

  /**
   * Check validity.
   * @return {Boolean} True if valid. False otherwise.
   */
  valid() {
    return EconomicSectorType.valid(this.type);
  }

  /**
   * Get the graphql type definition string for a graphql schema.
   * @return {String} The type definition.
   */
  graphQLTypeDefinition() {
    return `
                type ${this.graphQLType()} {
                    type: ${EconomicSectorType.graphQLType()}!
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
                    type: ${EconomicSectorType.graphQLType()}!
                }
            `;
  }

  /**
   * Get the graphql type name string for a graphql schema.
   * @return {String} The type name.
   */
  graphQLType() {
    return 'EconomicSector';
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
    return EconomicSectorType.graphQLTypeDefinition();
  }
}

/**
 * Check validity.
 * @param {EconomicSector} subject
 * @return {Boolean} True if valid. False otherwise.
 */
const validEconomicSector = (subject) => {
  return typeof subject.valid === 'function' && subject.valid();
};

/**
 * Check validity.
 * @param {Array<EconomicSector>} subjects
 * @return {Boolean} True if valid. False otherwise.
 */
const validEconomicSectors = (subjects) => {
  for (const subject of subjects) {
    if (!validEconomicSector(subject)) {
      return false;
    }
  }

  return true;
};

export {EconomicSector, validEconomicSector, validEconomicSectors};
