import { spawn } from 'child_process';

function createProcess(processPath, args = [], env = null) {
    args = [processPath].concat(args);

    console.log(`Executing: ${processPath}, Arguments: ${JSON.stringify(args)}`);
    return spawn('node', args, {
      env: Object.assign(
        {
          NODE_ENV: 'test'
        },
        env
      )
    });
  }

  export { createProcess };