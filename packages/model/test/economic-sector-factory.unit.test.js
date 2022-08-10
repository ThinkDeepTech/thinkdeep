import {EconomicSectorFactory, EconomicSectorType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-sector-factory', () => {
  describe('get', () => {
    it('should require a valid type', () => {
      const type = 'GOOGLE';
      expect(() => EconomicSectorFactory.get({type})).to.throw();
    });

    it('should freeze the object returned', () => {
      const type = EconomicSectorType.InformationTechnology;
      expect(() => {
        const obj = EconomicSectorFactory.get({
          type,
        });

        obj.type = 'SomethingDifferent';
      }).to.throw();
    });

    it('should return an economic sector', () => {
      const type = EconomicSectorType.InformationTechnology;
      expect(EconomicSectorFactory.get({type}).constructor.name).to.equal(
        'EconomicSector'
      );
    });

    it('should throw if an invalid input is supplied', () => {
      expect(() => EconomicSectorFactory.get(undefined)).to.throw();
    });

    it('should return an empty array if an empty array is supplied', () => {
      expect(EconomicSectorFactory.get([]).length).to.equal(0);
    });

    it('should throw if invalid data is supplied', () => {
      const obj1 = EconomicSectorFactory.get({
        type: EconomicSectorType.InformationTechnology,
      });
      const obj2 = {type: 'SOMETHING'};

      expect(() => EconomicSectorFactory.get([obj1, obj2])).to.throw();
    });

    it('should return valid objects if they are supplied', () => {
      const obj1 = EconomicSectorFactory.get({
        type: EconomicSectorType.InformationTechnology,
      });
      const obj2 = {type: EconomicSectorType.InformationTechnology};

      expect(() => EconomicSectorFactory.get([obj1, obj2])).not.to.throw();
    });
  });
});
