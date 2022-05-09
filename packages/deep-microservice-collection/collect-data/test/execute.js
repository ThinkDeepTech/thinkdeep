import concat from 'concat-stream';
import {createProcess} from './create-process.js';

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