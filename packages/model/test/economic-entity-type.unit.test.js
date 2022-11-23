import {EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-entity-type', () => {
  describe('valid', () => {
    it('should return false for non-registered types', () => {
      expect(EconomicEntityType.valid('SOMETHING_NOT_PRESENT')).to.equal(false);
    });
    it('should return true for registered types', () => {
      for (const type of EconomicEntityType.types) {
        expect(EconomicEntityType.valid(type)).to.equal(true);
      }
      expect(EconomicEntityType.types.length).to.be.greaterThan(0);
    });
  });

  describe('graphQLTypeDefinition', () => {
    it('should create the necessary graphql type', () => {
      expect(EconomicEntityType.graphQLTypeDefinition()).to.contain(
        `enum ${EconomicEntityType.graphQLType()}`
      );
      expect(EconomicEntityType.graphQLTypeDefinition()).to.contain(`{`);
      for (const type of EconomicEntityType.types) {
        expect(EconomicEntityType.graphQLTypeDefinition()).to.contain(type);
      }
      expect(EconomicEntityType.types.length).to.be.greaterThan(0);
      expect(EconomicEntityType.graphQLTypeDefinition()).to.contain(`}`);
    });
  });
});
