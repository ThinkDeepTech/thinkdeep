import { SQLDataSource } from 'datasource-sql';

const MINUTES = 60;

class PostgresDataSource extends SQLDataSource {
    search(businessName) {
        return this.knex.select('*').from('edge').where({
            name: businessName
        }).cache();
    }
};

export default PostgresDataSource;