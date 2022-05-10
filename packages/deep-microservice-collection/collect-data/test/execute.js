import concat from 'concat-stream';
import {createProcess} from './create-process.js';

/**
 * Execute an executable.
 *
 * @param {String} processPath Path to the executable (including executable name).
 * @param {Array<String>} args Arguments to apply to executable.
 * @param {Object} opts Options to apply to executable (i.e, environment setup)
 * @return {Promise<String>} Resolves to executable output or error.
 */
function execute(processPath, args = [], opts = {}) {
    const { env = null } = opts;
    const childProcess = createProcess(processPath, args, env);
    childProcess.stdin.setEncoding('utf-8');
    return new Promise((resolve, reject) => {
      childProcess.stderr.once('data', err => {
        reject(err.toString());
      });
      childProcess.on('error', reject);
      childProcess.stdout.pipe(
        concat(result => {
          resolve(result.toString());
        })
      );
    });
  }

export { execute };