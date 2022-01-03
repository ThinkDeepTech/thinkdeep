import { MongoDataSource } from "apollo-datasource-mongodb";

const validString = (val) => {
    return !!val && typeof val === 'string';
};

class EconomicEntityMemo extends MongoDataSource {

    constructor(collection, logger) {
        super(collection);

        this._logger = logger;
    }

    async collectingData(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        const entry = await this._readMemo(entityName, entityType);

        return !!entry;
    }

    async memoizeDataCollection(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        const collectingData = await this.collectingData(entityName, entityType);

        if (!collectingData) {
            this._logger.debug(`Memoizing entity with name: ${entityName}, type: ${entityType}.`);

            await this.collection.insertOne({ economicEntityName: entityName, economicEntityType: entityType });
        }
    }

    async readAll() {
        try {
            const results = this.collection.find({}).toArray();
            return results;
        } catch (e) {
            this._logger.error(`Economic entity read all failed. Received: ${e.message}`);
            return [];
        }
    }

    async _readMemo(entityName, entityType) {

        if (!validString(entityName)) throw new Error(`Entity name must be a valid string to memoize. Received: ${entityName}`);

        if (!validString(entityType)) throw new Error(`Entity type must be a valid string to memoize. Received: ${entityType}`);

        try {
            const entries = await this.collection.find({ economicEntityName: entityName, economicEntityType: entityType }).limit(1).toArray();
            return entries[0];
        } catch(e) {
            throw new Error(`Read memo failed for entity name: ${entityName}, entity type: ${entityType}. Error: ${e.message}`);
        }
    }
}

export { EconomicEntityMemo };