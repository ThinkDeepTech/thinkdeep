import { SQLDataSource } from 'datasource-sql';

class PostgresDataSource extends SQLDataSource {

    async search(businessName) {

        /**
         * Gather all edges related to the desired business.
         *
         * NOTE: Data is currently stored in the database such that the graph
         * is directed. There can be entries for both business A connected to
         * business B as well as business B connected to business A.
         */
        return this.
            knex('business').
            join('edge', 'business.id', '=', 'edge.first').
            select('*').
            whereIn('first', function() {
                this.select('id').from('business').where('name', 'like', businessName);
            }).
            orWhereIn('second', function() {
                this.select('id').from('business').where('name', 'like', businessName);
            }) || [];
    }
};

export { PostgresDataSource };