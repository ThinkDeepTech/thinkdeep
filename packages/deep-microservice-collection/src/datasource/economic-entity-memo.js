import {EconomicEntityFactory, validEconomicEntities} from '@thinkdeep/type';
import {MongoDataSource} from 'apollo-datasource-mongodb';

/**
 * Provides access to economic entity memo.
 */
class EconomicEntityMemo extends MongoDataSource {
  /**
   * Construct an instance.
   * @param {Object} collection MongoDB collection.
   * @param {Object} logger Logger to use.
   */
  constructor(collection, logger) {
    super(collection);

    this._logger = logger;
  }

  /**
   * Determine whether data is being collected.
   *
   * @param {Object} economicEntity Economic entity for which the check is being conducted.
   * @return {Boolean} True if data is already being collected. False otherwise.
   */
  async collectingData(economicEntity) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Economic entity was invalid. Received: ${economicEntity.toString()}`
      );
    }

    const entry = await this._readMemo(economicEntity);

    return !!entry;
  }

  /**
   * Memoize an economic entity.
   * @param {Object} economicEntity Economic entity for which the check is being conducted.
   */
  async memoizeDataCollection(economicEntity) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Economic entity was invalid. Received: ${economicEntity.toString()}`
      );
    }

    const collectingData = await this.collectingData(economicEntity);

    if (!collectingData) {
      this._logger.debug(`Memoizing ${economicEntity.toString()}.`);

      await this.collection.insertOne(economicEntity.toObject());
    }
  }

  /**
   * Read all economic entities from the memo.
   * @return {Array<Object>} Collection of economic entities or [].
   */
  async readEconomicEntities() {
    try {
      return EconomicEntityFactory.economicEntities(
        this.collection
          .find()
          .toArray()
          .filter((val) => validEconomicEntities([val]))
      );
    } catch (e) {
      this._logger.error(
        `Economic entity read all failed. Error: ${e.message}`
      );
      return [];
    }
  }

  /**
   * Read a specified entity from the memo.
   *
   * @param {Object} economicEntity Economic entity for which the check is being conducted.
   * @return {Object | null} Economic entity.
   */
  async _readMemo(economicEntity) {
    if (!validEconomicEntities([economicEntity])) {
      throw new Error(
        `Economic entity was invalid. Received: ${economicEntity.toString()}`
      );
    }

    try {
      const entries = await this.collection
        .find(economicEntity.toObject())
        .limit(1)
        .toArray();

      this._logger.debug(`Entries received: ${JSON.stringify(entries)}`);

      return entries[0]
        ? EconomicEntityFactory.economicEntity(entries[0])
        : null;
    } catch (e) {
      throw new Error(
        `Read memo failed for entity name: ${economicEntity.name}, entity type: ${economicEntity.type}. ${e.message}`
      );
    }
  }
}

export {EconomicEntityMemo};
