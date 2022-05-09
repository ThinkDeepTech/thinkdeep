import merge from 'deepmerge';

// NOTE: The relative path below is required otherwise the build errors out.
import baseConfig from "@thinkdeep/tools/rollup.config";

export default merge(baseConfig, {
  // if you use createSpaConfig, you can use your index.html as entrypoint,
  // any <script type="module"> inside will be bundled by rollup
  input: './index.html',

  // alternatively, you can use your JS as entrypoint for rollup and
  // optionally set a HTML template manually
  // input: './app.js',
});
