import chai from 'chai';
import mockDb from 'mock-knex';
const expect = chai.expect;

import { mockAllPostgresDataSourceObjects } from '../mock/postgres-datasource-mock.mjs';
import { EconomyService } from '../../src/service/economy-service.mjs';

describe('economy-service', () => {

    let dataSource;
    let subject;
    before((done) => {
        dataSource = mockAllPostgresDataSourceObjects();
        mockDb.mock(dataSource.knex);
        subject = new EconomyService(dataSource);
        done();
    });

    after((done) => {
        mockDb.unmock(dataSource.knex);
        done();
    });

    describe('get business relationships', () => {

        it('should validate that the business name is a string', () => {
            const actual = subject.getBusinessRelationships(1);
            expect(actual).to.equal([]);
        });

        it('should validate that business name is hydrated (length > 0)', () => {
            const actual = subject.getBusinessRelationships('');
            expect(actual).to.equal([]);
        });

        it('should return an empty array if operation fails', () => {
            assert.fail('TODO');
        });

        it('should validate the user is authorized to access the resource', () => {
            assert.fail('TODO');
        });

        it('should return an empty array if the user is unauthorized to access resource', () => {
            assert.fail('TODO');
        });

        it('should return a graph containing business relationships on success', () => {
            assert.fail('TODO');
        });
    });
});