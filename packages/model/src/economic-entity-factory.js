import {EconomicEntityType} from './economic-entity-type.js';
import {EconomicEntity} from './economic-entity.js';
import {validString} from './helpers.js';

/**
 * Factory providing access to economic entity objects.
 */
class EconomicEntityFactory {
  /**
   * Get an economic entity or entities.
   * @param {Array<Object> | Object} data Economic entity object representation of the form { name: <name string>, type: <economic entity type> } or an array of such entities.
   * @return {Array<EconomicEntity> | EconomicEntity} Immutable economic entity or array of such objects.
   */
  static get(data) {
    return Array.isArray(data)
      ? this._economicEntities(data)
      : this._economicEntity(data);
  }

  /**
   * Get an economic entity.
   * @param {Object} obj Economic entity object representation of the form { name: <name string>, type: <economic entity type> }.
   * @param {String} obj.name Name of the entity.
   * @param {String} obj.type EconomicEntityType string.
   * @return {EconomicEntity} Immutable economic entity.
   */
  static _economicEntity(obj) {
    if (!validString(obj.name)) {
      throw new Error(`Name ${obj.name} is invalid.`);
    }

    if (!EconomicEntityType.valid(obj.type)) {
      throw new Error(`Type ${obj.type} is not a valid economic entity type.`);
    }

    return Object.freeze(new EconomicEntity(obj.name, obj.type));
  }

  /**
   * Fetch an array of economic entities.
   * @param {Array<Object>} subjects Array having the form [{ name: <some string>, type: <an economic entity type>}].
   * @return {Array<EconomicEntity>} Economic entities or [].
   */
  static _economicEntities(subjects) {
    if (!Array.isArray(subjects)) {
      throw new Error(`${JSON.stringify(subjects)} is not a valid array.`);
    }

    const entities = [];
    for (const subject of subjects) {
      entities.push(this._economicEntity(subject));
    }

    return entities;
  }
}

export {EconomicEntityFactory};