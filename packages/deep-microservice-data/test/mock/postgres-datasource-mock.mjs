import { sinon } from 'sinon';

import { PostgresDataSource } from '../../src/datasource/postgres-datasource.mjs';

const mockAllPostgresDataSourceObjects = () => {
    PostgresDataSource.prototype.getBusinessGraph = sinon.spy();
    return new PostgresDataSource({ client: pg });
};

export { mockAllPostgresDataSourceObjects };