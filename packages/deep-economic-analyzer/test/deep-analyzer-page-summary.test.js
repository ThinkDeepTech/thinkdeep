// import { ApolloClient } from '@apollo/client/core';
// import {html, litFixtureSync, expect} from '@open-wc/testing';
// import { delayForPageRender } from '@thinkdeep/tools/test-helper.js';
// import { translate } from 'lit-element-i18n';
// import sinon from 'sinon';

// import '../deep-analyzer-page-summary';
// import { getUser } from '../user.js';
// import { initApolloClient } from '../graphql/client.js';

// describe('deep-analyzer-page-summary', () => {

//     let authClient;
//     beforeEach(async () => {

//         const user = await getUser();

//         await user.login(globalThis.location);

//         console.log('Apollo client: ' + JSON.stringify(globalThis.__APOLLO_CLIENT__))
//         await initApolloClient();
//     });

//     it('should allow users to collect data for a desired business', async () => {
//         const element = await litFixtureSync(html`<deep-analyzer-page-summary></deep-analyzer-page-summary>`);
//         await new Promise((resolve) => {
//             setTimeout(() => resolve(), 15000);
//         });
//     })

//     it('should allow users to analyze collected data', () => {

//     })

//     it('should allow users to select analysis for a business that was just collected', () => {

//     })

//     it('should display a graph of sentiment vs time', () => {

//     })

//     it('should display tweets when the user clicks on a point on the sentiment graph', () => {

//     })
// })
