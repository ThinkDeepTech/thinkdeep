import {MongoDataSource} from 'apollo-datasource-mongodb';

const validEmail = (userEmail) => {
    return !!userEmail && (typeof userEmail === 'string')
}

const validConfiguration = (configuration) => {
    return !!configuration && !!configuration?.observedEconomicEntities && !!Array.isArray(configuration?.observedEconomicEntities);
};

class ConfigurationStore extends MongoDataSource {

    async configurationExists(userEmail) {

        if(!validEmail(userEmail)) throw new Error(`Determination of an existant configuration requires a valid email. Received: ${userEmail}`);

        const configuration = await this.readConfigurationForUser(userEmail);
        return validConfiguration(configuration);
    }

    async createConfigurationForUser(userEmail, configuration) {

        if (!validEmail(userEmail)) throw new Error(`Creating a configuration requires a valid email. Received: ${userEmail}`);

        if (!validConfiguration(configuration)) throw new Error(`Creating a configuration requires a valid configuration. Received: ${JSON.stringify(configuration)}`);

        try {
            await this.collection.insertOne({ userEmail: userEmail, ...configuration });
        } catch (e) {
            throw new Error(`Configuration insertion failed: ${e.message}`);
        }
    }

    async readConfigurationForUser(userEmail) {

        if (!validEmail(userEmail)) throw new Error(`Reading a configuration requires a valid email. Received: ${userEmail}`);

        try {
            const configurations = await this.collection.find({userEmail: userEmail}).limit(1).toArray();
            return configurations[0];
        } catch (e) {
            throw new Error(`Configuration read failed: ${e.message}`);
        }
    }

    async updateConfigurationForUser(userEmail, configuration) {

        if (!validEmail(userEmail)) throw new Error(`Updating a configuration requires a valid email. Received: ${userEmail}`);

        if (!validConfiguration(configuration)) throw new Error(`Updating a configuration requires a valid configuration. Received: ${JSON.stringify(configuration)}`);

        try {
            await this.collection.updateOne({userEmail: userEmail}, { $set: { observedEconomicEntities: configuration.observedEconomicEntities }});
        } catch (e) {
            throw new Error(`Configuration update failed: ${e.message}`);
        }
    }
};

export { ConfigurationStore };