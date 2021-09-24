// This script is used to setup the microservice environment

/* eslint-disable no-console */

import {exec} from 'child_process';

exec('sudo apt-get install wget ca-certificates', (error) => {
  if (error) console.log('Failed to install wget with error: ${error}');
});

exec(
  'wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -',
  (error) => {
    if (error) console.log(`Failed to fetch postgres key. Error: ${error}`);
  }
);

exec(
  `sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ 'lsb_release -cs'-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'`,
  (error) => {
    if (error)
      console.log(
        `Failed to add postgress repository to host. Error: ${error}`
      );
  }
);

exec('sudo apt-get update', (error) => {
  if (error) console.log(`Failed to update packages. Error: ${error}`);
});

exec('sudo apt-get install postgresql postgresql-contrib', (error) => {
  if (error) console.log(`Failed to install Postgres. Error: ${error}`);
});
