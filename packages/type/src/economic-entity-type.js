/**
 * This class is essentially an enumeration type for economic entities.
 */
class EconomicEntityType {
  /**
   * Determine if a type is an economic entity type.
   * @param {String} type
   * @return {Boolean} True if the type is an economic entity type. False otherwise.
   */
  static valid(type) {
    return type in this.types;
  }

  /**
   * Business type.
   */
  static get Business() {
    return 'BUSINESS';
  }

  /**
   * Get all types.
   * @return {Array<String>} Economic entity types.
   */
  static get types() {
    return [this.Business];
  }

  /**
   * Get the graphql type definition string for a graphql schema.
   * @return {String} The type definition.
   */
  static graphQLTypeDefinition() {
    return `
            enum ${this.graphQLType()} {
                ${this.Business}
            }
        `;
  }

  /**
   * Get the graphql type name string for a graphql schema.
   * @return {String} The type name.
   */
  static graphQLType() {
    return 'EconomicEntityType';
  }
}

export {EconomicEntityType};
