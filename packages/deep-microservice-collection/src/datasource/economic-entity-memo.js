import { MongoDataSource } from "apollo-datasource-mongodb";
import { validString } from '../helpers.js';

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
     * @param {String} entityName Name of the economic entity (i.e, Google).
     * @param {String} entityType Type of the economic entity (i.e, BUSINESS).
     * @return {Boolean} True if data is already being collected. False otherwise.
     */
    async collectingData(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        const entry = await this._readMemo(entityName, entityType);

        return !!entry;
    }

    /**
     * Memoize an economic entity.
     * @param {String} entityName Name of the economic entity (i.e, Google).
     * @param {String} entityType Type of the economic entity (i.e, BUSINESS).
     */
    async memoizeDataCollection(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        const collectingData = await this.collectingData(entityName, entityType);

        if (!collectingData) {
            this._logger.debug(`Memoizing entity with name: ${entityName}, type: ${entityType}.`);

            await this.collection.insertOne({ name: entityName, type: entityType });
        }
    }

    /**
     * Read all economic entities from the memo.
     * @return {Array<Object>} Collection of economic entities or [].
     */
    async readEconomicEntities() {
        try {
            return this.collection.find({}).toArray();
        } catch (e) {
            this._logger.error(`Economic entity read all failed. Received: ${e.message}`);
            return [];
        }
    }

    /**
     * Read a specified entity from the memo.
     *
     * @param {String} entityName Name of the economic entity (i.e, Google).
     * @param {String} entityType Type of the economic entity (i.e, BUSINESS).
     * @return {Object} Economic entity.
     */
    async _readMemo(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        try {
            const entries = await this.collection.find({ name: entityName, type: entityType }).limit(1).toArray();
            return entries[0];
        } catch(e) {
            throw new Error(`Read memo failed for entity name: ${entityName}, entity type: ${entityType}. Error: ${e.message}`);
        }
    }
}

export { EconomicEntityMemo };