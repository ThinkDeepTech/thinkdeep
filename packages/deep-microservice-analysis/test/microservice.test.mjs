import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { Microservice } from '../src/microservice.mjs';

describe('microservice', () => {

    let logger;
    let apolloServer;
    let expressApp;
    let subject;
    beforeEach(() => {

        process.env.PORT = 4001;
        process.env.PATH = "/graphql";

        apolloServer = {
            start: sinon.stub(),
            applyMiddleware: sinon.stub()
        };

        expressApp = {
            disable: sinon.stub(),
            listen: (port, resolve) => {
                resolve()
            }
        };

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        }

        subject = new Microservice(apolloServer, expressApp, logger);
    });

    describe('listen', () => {

        it('should start the apollo server instance', async () => {
            apolloServer.start.returns(Promise.resolve());
            await subject.listen();
            expect(apolloServer.start).to.have.been.called;
        })

        it('should disable x-powered-by for security reasons', async () => {

            // NOTE: x-powered-by can allow attackers to determine what technologies are being used by software and
            // therefore how to attack. Therefore, it's disabled here.
            apolloServer.start.returns(Promise.resolve());

            await subject.listen();

            const args = expressApp.disable.getCall(0).args;
            expect(args[0]).to.equal('x-powered-by')
        })
    })
})