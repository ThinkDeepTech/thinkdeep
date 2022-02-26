import {getPublicIP} from '@thinkdeep/get-public-ip';

class Microservice {

    /**
     * @param {object} apolloServer - Apollo server instance.
     * @param {object} expressApp - Express instance.
     * @param {object} logger - The logger to use.
     */
    constructor(apolloServer, expressApp, logger) {
        this._apolloServer = apolloServer;
        this._expressApp = expressApp;
        this._logger = logger;
    }

    /**
     * Start server listener.
     */
    async listen() {

        this._logger.info(`Starting apollo server.`);
        await this._apolloServer.start();

        this._expressApp.disable('x-powered-by');

        // NOTE: Placing a forward slash at the end of any allowed origin causes a preflight error.
        let allowedOrigins = ['https://predecos.com', 'https://www.predecos.com', 'https://thinkdeep-d4624.web.app', 'https://www.thinkdeep-d4624.web.app']
        const production = process.env.NODE_ENV.toLowerCase() === 'production';
        if (!production) {
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

export { Microservice };