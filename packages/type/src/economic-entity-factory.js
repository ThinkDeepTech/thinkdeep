import {EconomicEntityType} from './economic-entity-type.js';
import {EconomicEntity} from './economic-entity.js';
import {validString} from './string.js';

/**
 * Factory providing access to economic entity objects.
 */
class EconomicEntityFactory {
  /**
   * Get an economic entity.
   * @param {String} name Name of the entity.
   * @param {String} type EconomicEntityType string.
   * @return {EconomicEntity} Immutable economic entity.
   */
  static economicEntity(name, type) {
    if (!validString(name)) {
      throw new Error(`Name ${name} is invalid.`);
    }

    if (!EconomicEntityType.valid(type)) {
      throw new Error(`Type ${type} is not a valid economic entity type.`);
    }

    return Object.freeze(new EconomicEntity(name, type));
  }

  /**
   * Fetch an array of economic entities.
   * @param {Array<Object>} subjects Array having the form [{ name: <some string>, type: <an economic entity type>}].
   * @return {Array<EconomicEntity>} Economic entities or [].
   */
  static economicEntities(subjects) {
    if (!Array.isArray(subjects)) {
      throw new Error(`${JSON.stringify(subjects)} is not a valid array.`);
    }

    const entities = [];
    for (const subject of subjects) {
      entities.push(this.economicEntity(subject.name, subject.type));
    }

    return entities;
  }
}

export {EconomicEntityFactory};