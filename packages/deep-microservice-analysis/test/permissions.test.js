import chai from 'chai';

import {hasReadAllAccess, isValidUser} from '../src/permissions.js';
const expect = chai.expect;

describe('permissions', () => {
  describe('hasReadAllAccess', () => {
    it('should return true if user has read:all scope', () => {
      expect(hasReadAllAccess({scope: 'read:all'})).to.equal(true);
    });

    it('should return false if the user does not have read:all scope', () => {
      expect(hasReadAllAccess({scope: 'openid email'})).to.equal(false);
    });
  });

  describe('isValidUser', () => {
    it('should ensure the user is not null', () => {
      expect(isValidUser(null)).to.equal(false);
    });

    it('should ensure the user has a scope property', () => {
      expect(isValidUser({})).to.equal(false);
    });

    it('should ensure the scope property is populated', () => {
      expect(isValidUser({scope: ''})).to.equal(false);
    });

    it('should return true if the user has a populated scope field', () => {
      expect(isValidUser({scope: 'something'})).to.equal(true);
    });
  });
});
