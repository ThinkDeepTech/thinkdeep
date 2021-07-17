import chai from 'chai';
const expect = chai.expect;

import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';

describe('deep-template-consultancy', () => {
  let element;
  beforeEach(() => {
    element = document.createElement('deep-template-consultancy');
  });

  it('should set the home path to /', () => {
    const routes = element.routes;
    var target = null;
    for (const route in routes) {
      console.log('ROUTE: ', route); // eslint-disable-line
      if (route.name.includes('home')) target = route;
    }

    expect(target.path).to.equal('/');
  });
});
