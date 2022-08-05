import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-entity-factory', () => {
  describe('economicEntity', () => {
    it('should require a valid name', () => {
      const name = '';
      const type = EconomicEntityType.Business;
      expect(() =>
        EconomicEntityFactory.economicEntity({name, type})
      ).to.throw();
    });

    it('should require a valid type', () => {
      const name = '';
      const type = 'GOOGLE';
      expect(() =>
        EconomicEntityFactory.economicEntity({name, type})
      ).to.throw();
    });

    it('should freeze the object returned', () => {
      const name = 'Google';
      const type = EconomicEntityType.Business;
      expect(() => {
        const economicEntity = EconomicEntityFactory.economicEntity({
          name,
          type,
        });

        economicEntity.name = 'SomethingDifferent';
      }).to.throw();
    });

    it('should return an economic entity', () => {
      const name = 'Google';
      const type = EconomicEntityType.Business;
      expect(
        EconomicEntityFactory.economicEntity({name, type}).constructor.name
      ).to.equal('EconomicEntity');
    });
  });

  describe('economicEntities', () => {
    it('should throw if a non array is supplied', () => {
      expect(() =>
        EconomicEntityFactory.economicEntities(undefined)
      ).to.throw();
    });

    it('should return an empty array if an empty array is supplied', () => {
      expect(EconomicEntityFactory.economicEntities([]).length).to.equal(0);
    });

    it('should throw if invalid economic entities are supplied', () => {
      const economicEntity1 = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const economicEntity2 = {name: 'Something', type: 'SOMETHING'};

      expect(() =>
        EconomicEntityFactory.economicEntities([
          economicEntity1,
          economicEntity2,
        ])
      ).to.throw();
    });

    it('should return valid economic entities if they are supplied', () => {
      const economicEntity1 = EconomicEntityFactory.economicEntity({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const economicEntity2 = {name: 'Something', type: 'BUSINESS'};

      expect(() =>
        EconomicEntityFactory.economicEntities([
          economicEntity1,
          economicEntity2,
        ])
      ).not.to.throw();
    });
  });
});
