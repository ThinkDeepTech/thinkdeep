import {EconomicSectorType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('economic-sector-type', () => {
  describe('valid', () => {
    it('should return false for non-registered types', () => {
      expect(EconomicSectorType.valid('SOMETHING_NOT_PRESENT')).to.equal(false);
    });
    it('should return true for registered types', () => {
      for (const type of EconomicSectorType.types) {
        expect(EconomicSectorType.valid(type)).to.equal(true);
      }
      expect(EconomicSectorType.types.length).to.be.greaterThan(0);
    });
  });

  describe('graphQLTypeDefinition', () => {
    it('should create the necessary graphql type', () => {
      expect(EconomicSectorType.graphQLTypeDefinition()).to.contain(
        `enum ${EconomicSectorType.graphQLType()}`
      );
      expect(EconomicSectorType.graphQLTypeDefinition()).to.contain(`{`);
      for (const type of EconomicSectorType.types) {
        expect(EconomicSectorType.graphQLTypeDefinition()).to.contain(type);
      }
      expect(EconomicSectorType.types.length).to.be.greaterThan(0);
      expect(EconomicSectorType.graphQLTypeDefinition()).to.contain(`}`);
    });
  });
});
