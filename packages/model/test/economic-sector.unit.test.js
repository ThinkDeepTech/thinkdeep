import {EconomicSectorType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import {EconomicSector} from '../src/economic-sector.js';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-sector', () => {
  describe('constructor', () => {
    it('should require a valid type', () => {
      const type = 'GOOGLE';
      expect(() => new EconomicSector({type})).to.throw();
    });
  });

  describe('equals', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicSector(EconomicSectorType.InformationTechnology);
    });

    it('should return false if the target is invalid', () => {
      const target = {type: 'SomethingInvalid'};
      expect(subject.equals(target)).to.equal(false);
    });

    it('should return false if the subject is invalid', () => {
      subject.type = 'Invalid';

      const target = new EconomicSector(
        EconomicSectorType.InformationTechnology
      );
      expect(subject.equals(target)).to.equal(false);
    });

    it('should return true if the subject type matches that of the target', () => {
      const target = new EconomicSector(
        EconomicSectorType.InformationTechnology
      );
      expect(subject.equals(target)).to.equal(true);
    });
  });

  describe('toObject', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicSector(EconomicSectorType.InformationTechnology);
    });

    it('should return a frozen object', () => {
      const obj = subject.toObject();
      expect(() => {
        obj.name = 'Something different';
      }).to.throw();
    });

    it('should return an object with the type field included', () => {
      const obj = subject.toObject();
      expect(obj.type).to.equal(subject.type);
    });
  });

  describe('toString', () => {
    let subject;
    beforeEach(() => {
      subject = new EconomicSector(EconomicSectorType.InformationTechnology);
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
      subject = new EconomicSector(EconomicSectorType.InformationTechnology);
    });

    it('should return false when an invalid type is present', () => {
      subject.type = 'Invalid';
      expect(subject.valid()).to.equal(false);
    });

    it('should return true when an a valid type is present', () => {
      expect(subject.valid()).to.equal(true);
    });
  });
});
