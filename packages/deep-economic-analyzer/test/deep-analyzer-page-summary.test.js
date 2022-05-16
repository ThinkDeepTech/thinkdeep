import {html, litFixtureSync} from '@open-wc/testing';
import {delayForPageRender} from '@thinkdeep/tools/test-helper.js';
// import { translate } from 'lit-element-i18n';
// import sinon from 'sinon';

import '../deep-analyzer-page-summary.js';
import {setAuthClientForTesting, getUser} from '../user.js';
import {initApolloClient} from '../graphql/client.js';

import {testAuthClient} from './test-auth-client.js';

describe('deep-analyzer-page-summary', () => {
  it.only('should allow users to collect data for a desired business', async () => {
    const authClient = await testAuthClient();

    setAuthClientForTesting(authClient);

    const user = await getUser();

    // TODO Pass user into apollo client
    await initApolloClient(user);

    await litFixtureSync(
      html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`
    );

    await delayForPageRender();
  });

  it('should allow users to analyze collected data', () => {});

  it('should allow users to select analysis for a business that was just collected', () => {});

  it('should display a graph of sentiment vs time', () => {});

  it('should display tweets when the user clicks on a point on the sentiment graph', () => {});
});
