import {attachExitHandler} from '@thinkdeep/attach-exit-handler';
import {getPublicIP} from '@thinkdeep/get-public-ip';

class AnalysisClient {

    constructor(mongoClient, kafkaClient, apolloServer, expressApp, analysisService, logger) {
        this._mongoClient = mongoClient;
        this._kafkaClient = kafkaClient;
        this._apolloServer = apolloServer;
        this._expressApp = expressApp;
        this._analysisService = analysisService;
        this._logger = logger;
    }


    async connect() {

        if (!this._kafkaClient)
            throw new Error(`The kafka client needs to be defined in order to connect to the anaylsis service.`);

        if (!this._mongoClient)
            throw new Error(`The mongo client needs to be defined in order to connect to the anaylsis service.`);

        await attachExitHandler(( async () => {

            this._logger.info('Closing MongoDB connection.');
            await this._mongoClient.close();

        }).bind(this));

        this._logger.info('Connecting to MongoDB.');
        await this._mongoClient.connect();

        this._logger.info(`Connecting to analysis service.`);
        await this._analysisService.connect();
    }

    async listen() {

        this._logger.info(`Starting apollo server.`);
        await this._apolloServer.start();

        // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
        // therefore how to attack. Therefore, it's disabled here.
        this._expressApp.disable('x-powered-by');

        // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
        let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
        const isProduction = process.env.NODE_ENV.toLowerCase() === 'production';
        if (!isProduction) {
            allowedOrigins = allowedOrigins.concat(['https://localhost:8000', 'http://localhost:8000', 'https://studio.apollographql.com']);
        }

        this._logger.debug(`Applying middleware.`);
        this._apolloServer.applyMiddleware({
            app: this._expressApp,
            cors: {
            origin: allowedOrigins,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE',
            credentials: true,
            },
        });

        const port = 4001;
        await new Promise(((resolve) => this._expressApp.listen({port}, resolve)).bind(this));
        this._logger.info(`🚀 Server ready at http://${getPublicIP()}:${port}${this._apolloServer.graphqlPath}`);
    }
}

export { AnalysisClient };