import {EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import {EconomicEntity} from '../src/economic-entity.js';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-entity', () => {
  describe('constructor', () => {
    it('should require a valid name', () => {
      const name = '';
      const type = EconomicEntityType.Business;
      expect(() => new EconomicEntity({name, type})).to.throw();
    });

    it('should require a valid type', () => {
      const name = '';
      const type = 'GOOGLE';
      expect(() => new EconomicEntity({name, type})).to.throw();
    });
  });

  describe('equals', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicEntity('Google', EconomicEntityType.Business);
    });

    it('should return false if the target economic entity is invalid', () => {
      const economicEntity = {name: 'Amazon', type: 'SomethingInvalid'};
      expect(subject.equals(economicEntity)).to.equal(false);
    });

    it('should return false if the subject economic entity is invalid', () => {
      subject.type = 'Invalid';

      const economicEntity = new EconomicEntity(
        'Amazon',
        EconomicEntityType.Business
      );
      expect(subject.equals(economicEntity)).to.equal(false);
    });

    it('should return true if the subject economic entity type and name match that of the target', () => {
      const economicEntity = new EconomicEntity(
        'Google',
        EconomicEntityType.Business
      );
      expect(subject.equals(economicEntity)).to.equal(true);
    });
  });

  describe('toObject', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicEntity('Google', EconomicEntityType.Business);
    });

    it('should return a frozen object', () => {
      const obj = subject.toObject();
      expect(() => {
        obj.name = 'Something different';
      }).to.throw();
    });

    it('should return an object with the name field included', () => {
      const obj = subject.toObject();
      expect(obj.name).to.equal(subject.name);
    });

    it('should return an object with the type field included', () => {
      const obj = subject.toObject();
      expect(obj.type).to.equal(subject.type);
    });
  });

  describe('toString', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicEntity('Google', EconomicEntityType.Business);
    });

    it('should return the object in json form', () => {
      const target = subject.toString();

      expect(target).to.include('{');
      for (const property in subject) {
        if (Object.prototype.hasOwnProperty.call(subject, property)) {
          expect(target).to.include(`"${property}":"${subject[property]}"`);
        }
      }
      expect(target).to.include('}');
      expect(Object.keys(subject).length).to.be.greaterThan(0);
    });
  });

  describe('valid', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicEntity('Google', EconomicEntityType.Business);
    });

    it('should return false when an empty name is present', () => {
      subject.name = '';
      expect(subject.valid()).to.equal(false);
    });

    it('should return false when an invalid type is present', () => {
      subject.type = 'Invalid';
      expect(subject.valid()).to.equal(false);
    });

    it('should return true when an a valid type and name are present', () => {
      expect(subject.valid()).to.equal(true);
    });
  });
});
