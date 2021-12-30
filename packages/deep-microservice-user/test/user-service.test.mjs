import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { UserService } from '../src/user-service.mjs';

describe('user-service', () => {

    let logger;
    let subject;
    beforeEach(() => {

        logger = {
            debug: sinon.stub(),
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub()
        };

        subject = new UserService(logger);
    });
});