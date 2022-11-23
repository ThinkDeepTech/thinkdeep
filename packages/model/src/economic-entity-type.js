/**
 * This class is essentially an enumeration type for economic entities.
 */
class EconomicEntityType {
  /**
   * Determine if a type is valid.
   * @param {String} type
   * @return {Boolean} True if the type is valid. False otherwise.
   */
  static valid(type) {
    return this.types.includes(type);
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
                ${this.types.map(
                  (type) => `
                  ${type}
                `
                )}
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
