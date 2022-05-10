import { spawn } from 'child_process';

/**
 * Create a process.
 *
 * @param {String} processPath Path to the executable.
 * @param {Array<String>} args Process arguments.
 * @param {Object} env Environment variables to apply.
 * @return {ChildProcessWithoutNullStreams} Child process.
 */
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