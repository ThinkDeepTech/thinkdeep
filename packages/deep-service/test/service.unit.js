import { expect } from 'chai';
import Service from '../service';

describe('service core', () => {
  describe('configurations', () => {
    it('should throw an error if options lack name definition', done => {
      try {
        new Service({ port: 3000 });
      } catch (e) {
        expect(e instanceof Error).to.equal(true);
        done();
      }
    });
  });
});
