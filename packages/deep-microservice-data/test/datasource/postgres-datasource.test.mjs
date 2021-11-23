import chai from 'chai';
import mockDb from 'mock-knex';
const expect = chai.expect;

import { PostgresDataSource } from '../../src/datasource/postgres-datasource.mjs';

describe('postgres-datasource', () => {

    let dataSource;
    before((done) => {
        dataSource =  new PostgresDataSource({ client: 'pg' });
        mockDb.mock(dataSource.knex);
        done();
    });

    after((done) => {
        mockDb.unmock(dataSource.knex);
        done();
    });

    let tracker;
    beforeEach((done) => {
        tracker = mockDb.getTracker();
        tracker.install();
        done();
    });

    afterEach((done) => {
        tracker.uninstall();
        done();
    });

    describe('get economic relationships', () => {

        it('should search the database for all graph edges that relate to business name', (done) => {
            const expectedBusinessName = 'Some Business';
            tracker.on('query', (query) => {
                /**
                 * NOTE: The try/catch statement below is necessary for the tests to execute properly.
                 * It's not clear why this is the case. However, more information can be found at the
                 * following link: https://robporter.ca/tdd-knex-nodejs/
                 */
                try {
                    const actualBusinessName = query.bindings[0];
                    expect(actualBusinessName).to.equal(expectedBusinessName);
                    done();
                } catch (e) {
                    done(e);
                }
                query.response([]);
            });

            dataSource.searchBusinesses(expectedBusinessName);
        });

        it('should perform a case-insensitive search for the business name', (done) => {
            const expectedBusinessName = 'Some Business';
            tracker.on('query', (query) => {
                /**
                 * NOTE: The try/catch statement below is necessary for the tests to execute properly.
                 * It's not clear why this is the case. However, more information can be found at the
                 * following link: https://robporter.ca/tdd-knex-nodejs/
                 */
                try {
                    expect(query.sql).to.include(' like ');
                    done();
                } catch (e) {
                    done(e);
                }
                query.response([]);
            });
            dataSource.searchBusinesses(expectedBusinessName);
        })
    });
});