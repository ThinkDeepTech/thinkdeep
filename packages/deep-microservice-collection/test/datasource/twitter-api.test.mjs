import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { TwitterAPI } from '../../src/datasource/twitter-api.mjs';

chai.use(sinonChai);
const expect = chai.expect;

describe('twitter-api', () => {

    let subject;
    beforeEach(() => {
        TwitterAPI.prototype.get = sinon.stub();
        subject = new TwitterAPI();
    });

    it('should be targeting the correct base url', () => {
        expect(subject.baseURL).to.contain('https://api.twitter.com/2/');
    })

    describe('getTweets', () => {
        it('should issue a get request', async () => {
            await subject.getTweets('somebusiness');
            expect(subject.get).to.have.been.called;
        })

        it('should issue the request to the recent tweets end point', async () => {
            const businessName = 'somebusiness';
            const query = encodeURIComponent(`${businessName} lang:en`);
            await subject.getTweets(businessName);
            expect(subject.get.withArgs(`tweets/search/recent?query=${query}`)).to.have.been.called;
        })

        it('should fetch tweets that are english', async () => {
            const businessName = 'somebusiness';
            const languageSpec = 'lang:en';
            const query = encodeURIComponent(`${businessName} ${languageSpec}`);
            await subject.getTweets(businessName);
            expect(subject.get.withArgs(`tweets/search/recent?query=${query}`)).to.have.been.called;
        })

        it('should url encode the query', async () => {
            const businessName = 'somebusiness';
            const languageSpec = 'lang:en';
            const query = encodeURIComponent(`${businessName} ${languageSpec}`);
            await subject.getTweets(businessName);
            expect(subject.get.withArgs(`tweets/search/recent?query=${query}`)).to.have.been.called;
        })
    });
});