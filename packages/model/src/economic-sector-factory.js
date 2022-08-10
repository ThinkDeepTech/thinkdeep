import {EconomicSector} from './economic-sector.js';
import {EconomicSectorType} from './economic-sector-type.js';

/**
 * Economic sector factory.
 */
class EconomicSectorFactory {
  /**
   * Get economic sectors.
   * @param {Array<Object> | Object} data Economic sector object or an array of such objects.
   * @return {Array<EconomicSector> | EconomicSector} Immutable economic sector or array of such objects.
   */
  static get(data) {
    return Array.isArray(data)
      ? this._economicSectors(data)
      : this._economicSector(data);
  }

  /**
   * Get an economic sector.
   * @param {Object} obj Input data.
   * @param {String} obj.type EconomicSectorType string.
   * @return {EconomicEntity} Immutable economic sector.
   */
  static _economicSector(obj) {
    if (!EconomicSectorType.valid(obj.type)) {
      throw new Error(`Type ${obj.type} is invalid.`);
    }

    return Object.freeze(new EconomicSector(obj.type));
  }

  /**
   * Fetch an array of economic sectors.
   * @param {Array<Object>} subjects Array having the form [{ type: <an economic sector type>}].
   * @return {Array<EconomicSector>} Economic sectors or [].
   */
  static _economicSectors(subjects) {
    if (!Array.isArray(subjects)) {
      throw new Error(`${JSON.stringify(subjects)} is not a valid array.`);
    }

    const results = [];
    for (const subject of subjects) {
      results.push(this._economicSector(subject));
    }

    return results;
  }
}

export {EconomicSectorFactory};
