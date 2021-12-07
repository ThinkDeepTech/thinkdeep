import chai from 'chai';
import mockDb from 'mock-knex';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { AnalysisService } from '../../src/service/analysis-service.mjs';
import { PostgresDataSource } from '../../src/datasource/postgres-datasource.mjs';

describe('analysis-service', () => {

    let dataSource;
    let subject;
    before((done) => {
        PostgresDataSource.prototype.getBusinessGraph = sinon.spy();
        dataSource = new PostgresDataSource({ client: 'pg' });
        mockDb.mock(dataSource.knex);
        subject = new AnalysisService(dataSource);
        done();
    });

    after((done) => {
        mockDb.unmock(dataSource.knex);
        done();
    });

    describe('getBusinessRelationships', () => {

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
            const relationships = subject.getBusinessRelationships(businessName, { scope: '' });
            expect(relationships.length).to.equal(0);
        })

        it('should return empty array if user does not have read:all scope', () => {
            const businessName = 'something';
            const relationships = subject.getBusinessRelationships(businessName, { scope: 'openid email' });
            expect(relationships.length).to.equal(0);
        })

        it('should succeed if user has read:all scope', () => {
            const businessName = 'something';
            subject.getBusinessRelationships(businessName, { scope: 'read:all' });
            expect(subject._dataSource.getBusinessGraph).to.have.been.called;
        })
    })

    describe('getSentiment', () => {

        it('should return an empty object if economic entity name is empty', () => {
            const economicEntityName = "";
            const economicEntityType = "BUSINESS";
            const user = { scope: "read:all" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity name is not a string', () => {
            const economicEntityName = {};
            const economicEntityType = "BUSINESS";
            const user = { scope: "read:all" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity type is empty', () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "";
            const user = { scope: "read:all" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if economic entity type is not a string', () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = [];
            const user = { scope: "read:all" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should return an empty object if the user does not have read:all scope', () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).to.equal(0);
        })

        it('should successfully execute if the user has read:all scope', () => {
            const economicEntityName = "SomeBusinessName";
            const economicEntityType = "BUSINESS";
            const user = { scope: "profile email read:all" };
            const response = subject.getSentiment(economicEntityName, economicEntityType, user);
            expect(Object.keys(response).length).not.to.equal(0);
        })
    });
})