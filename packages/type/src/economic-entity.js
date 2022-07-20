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
            ${EconomicEntityType.graphQLTypeDefinition()}

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
            ${EconomicEntityType.graphQLTypeDefinition()}

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
}

export {EconomicEntity};
