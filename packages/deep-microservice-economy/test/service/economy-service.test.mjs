import chai from 'chai';
import mockDb from 'mock-knex';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { EconomyService } from '../../src/service/economy-service.mjs';
import { PostgresDataSource } from '../../src/datasource/postgres-datasource.mjs';

describe('economy-service', () => {

    let dataSource;
    let subject;
    before((done) => {
        dataSource = new PostgresDataSource({ client: 'pg' });
        mockDb.mock(dataSource.knex);
        PostgresDataSource.prototype.getBusinessGraph = sinon.spy();
        subject = new EconomyService(dataSource);
        done();
    });

    after((done) => {
        mockDb.unmock(dataSource.knex);
        done();
    });

    describe('get business relationships', () => {

        it('should return an empty array if type validation fails', () => {
            const businessName = 1;
            const actual = subject.getBusinessRelationships(businessName);
            expect(actual.length).to.equal(0);
        });

        it('should validate that the business name is a string', () => {
            const businessName = 1;
            subject.getBusinessRelationships(businessName);
            expect(dataSource.getBusinessGraph).not.to.have.been.called;
        });

        it('should validate that business name is hydrated (length > 0)', () => {
            const businessName = '';
            subject.getBusinessRelationships(businessName);
            expect(dataSource.getBusinessGraph).not.to.have.been.called;
        });

        it('should return empty array if user is null', () => {
            const businessName = 'something';
            const relationships = subject.getBusinessRelationships(businessName, null);
            expect(relationships.length).to.equal(0);
        })

        it ('should return empty array if user is empty', () => {
            const businessName = 'something';
            const relationships = subject.getBusinessRelationships(businessName, {});
            expect(relationships.length).to.equal(0);
        })

        it('should return empty array if user does not have defined scopes', () => {
            const businessName = 'something';
            const relationships = subject.getBusinessRelationships(businessName, { scopes: [] });
            expect(relationships.length).to.equal(0);
        })

        it('should succeed if user has read:all scope', () => {
            const businessName = 'something';
            const relationships = subject.getBusinessRelationships(businessName, { scopes: ['read:all'] });
            expect(subject._dataSource.getBusinessGraph).to.have.been.called;
        })
    });
});