import chai from 'chai';
const expect = chai.expect;

import '@thinkdeep/deep-template-consultancy/deep-template-consultancy.js';

describe('deep-template-consultancy', () => {
  let element;
  beforeEach(() => {
    element = document.createElement('deep-template-consultancy');
  });

  it('should set the home path to /', () => {
    expect(element).not.to.equal(undefined);
  });
});
