import { SQLDataSource } from 'datasource-sql';

class PostgresDataSource extends SQLDataSource {
    search(businessName) {
        return this.knex.select("*").
            from('edge').
            whereIn('first', function() {
                this.select('id').from('business').where({ name: businessName })
            }).
            orWhereIn('second', function() {
                this.select('id').from('business').where({ name: businessName })
            }).cache();
    }
};

export { PostgresDataSource };