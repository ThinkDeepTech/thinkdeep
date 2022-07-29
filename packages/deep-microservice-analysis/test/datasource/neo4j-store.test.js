import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import neo4jDriver from 'neo4j-driver';

import {Neo4jStore} from '../../src/datasource/neo4j-store.js';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('neo4j-store', () => {
  let subject;
  let neo4j;
  let driver;
  let session;
  beforeEach(() => {
    neo4j = sinon.stub(neo4jDriver);

    driver = sinon.createStubInstance(neo4j.Driver);

    session = sinon.createStubInstance(neo4j.Session);

    neo4j.driver.returns(driver);

    driver.session.returns(session);

    subject = new Neo4jStore({
      url: 'neo4j://some/url',
      authToken: neo4j.auth.basic('magical', 'thing'),
      defaultDatabase: 'neo4j',
      defaultAccessMode: neo4j.session.READ,
      neo4j,
    });
  });

  describe('addSentiments', () => {
    it('should throw if invalid economic entities are provided', async () => {
      const economicEntity = {
        name: 'google',
        type: 'GOOGLE',
      };
      const datas = [];

      await expect(
        subject.addSentiments(economicEntity, datas)
      ).to.be.rejectedWith(Error);
    });
  });
});
