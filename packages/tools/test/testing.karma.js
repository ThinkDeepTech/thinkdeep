import { html } from 'lit-html';
import { stamp } from '@thinkdeep/tools/testing';

// TODO Test remove function
describe('testing tools:', () => {
  describe('stamp', () => {
    it('should throw an error if something other than a TemplateResult is passed in', async () => {
      expect(stamp()).to.eventually.be.rejectedWith(TypeError);
    });
    it('should accept a TemplateResult', () => {
      // expect(stamp(
      //     html`<button></button>`
      // )).not.to.be.rejectedWith(TypeError);
      expect(stamp(html`<button></button>`)).not.to.eventually.be.rejectedWith(TypeError);
    });
  });
});
