/**
 * Economic sector type enumerations.
 */
class EconomicSectorType {
  /**
   * Information technology sector type.
   * @return {String} Sector name.
   */
  static get InformationTechnology() {
    return 'INFORMATION_TECHNOLOGY';
  }

  /**
   * Determine if a type valid.
   * @param {String} type
   * @return {Boolean} True if the type is valid. False otherwise.
   */
  static valid(type) {
    return this.types.includes(type);
  }

  /**
   * Get all types.
   * @return {Array<String>} Economic sector types.
   */
  static get types() {
    return [this.InformationTechnology];
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
    return 'EconomicSectorType';
  }
}

export {EconomicSectorType};
