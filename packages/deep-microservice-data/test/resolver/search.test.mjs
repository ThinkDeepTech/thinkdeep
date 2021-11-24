import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { search } from '../../src/resolver/search.mjs';

describe('search', () => {

    let graphqlArgs;
    let graphqlContext;
    beforeEach(() => {
        graphqlArgs = {
            businessName: 'Some Business'
        };
        graphqlContext = {
            dataSources: {
                economyService: {
                    getBusinessRelationships: sinon.spy()
                }
            }
        };
    });

    it('should perform the search against the db', () => {
        search(undefined, graphqlArgs, graphqlContext);
        expect(graphqlContext.dataSources.economyService.getBusinessRelationships).to.have.been.calledOnce;
    });

    it('should search for the specified business name', () => {
        search(undefined, graphqlArgs, graphqlContext);
        const actualBusinessName = graphqlContext.dataSources.economyService.getBusinessRelationships.getCall(0).args[0];
        expect(graphqlArgs.businessName).to.equal(actualBusinessName);
    });
});