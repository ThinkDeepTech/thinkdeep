import { html } from 'lit-html';
import { stamp } from '@thinkdeep/tools/testing';

// TODO Test remove function
describe('testing tools:', () => {
  describe('stamp', () => {
    it('should throw an error if something other than a TemplateResult is passed in', done => {
      stamp().then(null, error => {
        expect(error instanceof TypeError).to.equal(true);
        done();
      });
    });
    it('should accept a TemplateResult', done => {
      stamp(html`<button></button>`).then(component => {
        expect(component instanceof HTMLElement).to.equal(true);
        done();
      });
    });
  });
});
