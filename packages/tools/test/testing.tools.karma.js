import { html } from 'lit-html';
import { stamp, remove } from '@thinkdeep/tools/testing';

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
    it('should append the component to the document', done => {
      sinon.spy(document, 'createElement');
      stamp(html`<button></button>`).then(() => {
        expect(document.createElement).to.have.been.called;
        done();
      });
    });
  });

  describe('remove', () => {
    it('should remove the child component from its parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);
      expect(parent.childElementCount).to.equal(1);
      remove(child);
      expect(parent.childElementCount).to.equal(0);
    });
  });
});
