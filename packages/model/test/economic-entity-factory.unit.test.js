import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-entity-factory', () => {
  describe('get', () => {
    it('should require a valid name', () => {
      const name = '';
      const type = EconomicEntityType.Business;
      expect(() => EconomicEntityFactory.get({name, type})).to.throw();
    });

    it('should require a valid type', () => {
      const name = '';
      const type = 'GOOGLE';
      expect(() => EconomicEntityFactory.get({name, type})).to.throw();
    });

    it('should freeze the object returned', () => {
      const name = 'Google';
      const type = EconomicEntityType.Business;
      expect(() => {
        const economicEntity = EconomicEntityFactory.get({
          name,
          type,
        });

        economicEntity.name = 'SomethingDifferent';
      }).to.throw();
    });

    it('should return an economic entity', () => {
      const name = 'Google';
      const type = EconomicEntityType.Business;
      expect(EconomicEntityFactory.get({name, type}).constructor.name).to.equal(
        'EconomicEntity'
      );
    });

    it('should throw if an invalid input is supplied', () => {
      expect(() => EconomicEntityFactory.get(undefined)).to.throw();
    });

    it('should return an empty array if an empty array is supplied', () => {
      expect(EconomicEntityFactory.get([]).length).to.equal(0);
    });

    it('should throw if invalid economic entities are supplied', () => {
      const obj1 = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const obj2 = {name: 'Something', type: 'SOMETHING'};

      expect(() => EconomicEntityFactory.get([obj1, obj2])).to.throw();
    });

    it('should return valid economic entities if they are supplied', () => {
      const obj1 = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const obj2 = {name: 'Something', type: 'BUSINESS'};

      expect(() => EconomicEntityFactory.get([obj1, obj2])).not.to.throw();
    });
  });
});
