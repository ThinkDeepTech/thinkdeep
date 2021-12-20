## Dependencies
- [Postgres](https://www.postgresql.org/)
    1. Ubuntu help doc (https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

## Developer Setup (Ubuntu)
- Execute setup script.
```console
    node ./setup.js
```
- Currently, the database is young. So, execution of setupDB.sql will only partially work.
- Add the following environment variables:
    1. PREDECOS_PG_CONNECTION_STRING : Ensure this is equal to the postgres connection string associated with the database.
    1. PREDECOS_MICROSERVICE_COLLECTION_URL
    1. POSTGRES_PASSWORD

## Notes

- Running postgres on kubernetes requires passing values into envsubstr to avoid storing sensitive info in git:
```console

    envsubst < deployment.yaml | kubectl apply -f -

```