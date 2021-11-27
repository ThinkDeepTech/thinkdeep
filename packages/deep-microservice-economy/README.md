## Developer Setup (Ubuntu)
- Execute setup script.
```console
    node ./setup.js
```
- Currently, the database is young. So, execution of setupDB.sql will only partially work. TODO
- Add the following environment variables:
    1. PREDECOS_PG_CONNECTION_STRING : Ensure this is equal to the postgres connection string associated with the database.