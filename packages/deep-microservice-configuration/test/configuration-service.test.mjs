import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { ConfigurationService } from '../src/configuration-service.mjs';

describe('configuration-service', () => {

    let logger;
    let subject;
    beforeEach(() => {

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        subject = new ConfigurationService(logger);
    });
});