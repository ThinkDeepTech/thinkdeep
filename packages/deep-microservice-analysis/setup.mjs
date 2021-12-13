// This script is used to setup the microservice environment

/* eslint-disable no-console */

import {exec} from 'child_process';

/**
 * Execute a given command throwing errors if needed.
 * @param {String} command - System command to execute.
 * @param {Function} callback - Of the form (outputSplitOnNewline) => { //...do stuff }. The callback to execute on the result of successful command execution.
 */
const execute = (
  command,
  callback = () => {
    /** Do nothing */
  }
) => {
  exec(command, { shell: false}, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error) throw error;
    const components = stdout.trim().split('\n');
    callback(components);
  });
};

execute('sudo apt-get install wget ca-certificates');
execute(
  'wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -'
);

execute('lsb_release -cs', (installedDistributionComponents) => {
  console.log('Finding repositories stored on host...');
  execute(
    'find /etc/apt/ -name *.list | xargs cat | grep  ^[[:space:]]*deb',
    (installedRepositories) => {
      const currentlyInstalledDistribution = installedDistributionComponents[0];

      execute(
        `echo "deb http://apt.postgresql.org/pub/repos/apt/ ${currentlyInstalledDistribution}-pgdg main"`,
        (targetRepositories) => {
          const targetRepository = targetRepositories[0];

          let foundRepository = false;
          for (const installedRepository of installedRepositories)
            if (targetRepository === installedRepository)
              foundRepository = true;

          if (foundRepository) {
            console.log(
              'Found postgres repository in host so skipping repository install.'
            );
            return;
          }

          console.log('Adding postgres repository to host lists...');
          execute(
            `sudo sh -c "echo '${targetRepository}'" >> /etc/apt/sources.list.d/pgdg.list`
          );
        }
      );
    }
  );
});

execute('sudo apt-get update', () => {
  console.log('Installing postgres...');
  execute('sudo apt-get install -y postgresql postgresql-contrib', () => {
    console.log('Creating database predecos...');
    execute(`sudo -u postgres createdb -U postgres predecos`);
  });
});
