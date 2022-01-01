import {MongoDataSource} from 'apollo-datasource-mongodb';

class ConfigurationStore extends MongoDataSource {

    async configurationExists(userEmail) {
        const configuration = await this.readConfigurationForUser(userEmail);
        return configuration && configuration?.observedEconomicEntities;
    }

    async createConfigurationForUser(userEmail, configuration) {
        await this.collection.insertOne({ userEmail: userEmail, ...configuration });
    }

    async readConfigurationForUser(userEmail) {
        const configurations = await this.collection.find({userEmail: userEmail}).limit(1).toArray();
        return configurations[0];
    }

    async updateConfigurationForUser(userEmail, configuration) {
        await this.collection.updateMany({userEmail: userEmail}, { $set: { observedEconomicEntities: configuration.observedEconomicEntities }});
    }
};

export { ConfigurationStore };