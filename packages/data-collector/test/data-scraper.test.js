import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import DDG from 'duck-duck-scrape';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {DataScraper} from '../src/data-scraper.js';
const expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('data-scraper', () => {
  const hostname = 'www.investopedia.com';
  const baseUrl = `https://${hostname}`;
  const uncheckedSites = {
    noResults: false,
    vqd: '3-115640533494082956352430452647886046476-292102332436959021530042850540532053869',
    results: [
      {
        title: 'Who Are Google&#x27;s Competitors? - Business Partner Magazine',
        description:
          "Bing and Yahoo are some companies that make <b>Google</b> work up a sweat. Apart from these companies, <b>Google</b> also has some rather indirect competition. Facebook and Amazon are examples of notable indirect <b>competitors</b> of <b>Google</b>. All in all, <b>Google</b> has both big and small rivalries. This piece will only highlight <b>Google's</b> major <b>competitors</b>.",
        rawDescription:
          'Bing and Yahoo are some companies that make <b>Google</b> work up a sweat. Apart from these companies, <b>Google</b> also has some rather indirect competition. Facebook and Amazon are examples of notable indirect <b>competitors</b> of <b>Google</b>. All in all, <b>Google</b> has both big and small rivalries. This piece will only highlight <b>Google&#x27;s</b> major <b>competitors</b>.',
        hostname: 'businesspartnermagazine.com',
        icon: 'https://external-content.duckduckgo.com/ip3/businesspartnermagazine.com.ico',
        url: 'https://businesspartnermagazine.com/who-are-googles-competitors/',
      },
      {
        title: 'Who Are Google&#x27;s Main Competitors? - Investopedia',
        description:
          "Internet pioneer and media company AOL is also considered to be <b>Google's</b> <b>competitor</b>. In other countries such as China, <b>Google</b> is banned from conducting <b>business</b>; there, the number one search engine...",
        rawDescription:
          'Internet pioneer and media company AOL is also considered to be <b>Google&#x27;s</b> <b>competitor</b>. In other countries such as China, <b>Google</b> is banned from conducting <b>business</b>; there, the number one search engine...',
        hostname,
        icon: 'https://external-content.duckduckgo.com/ip3/www.investopedia.com.ico',
        url: `${baseUrl}/ask/answers/120314/who-are-googles-goog-main-competitors.asp`,
        bang: {
          prefix: 'ivst',
          title: 'Investopedia',
          domain: hostname,
        },
      },
      {
        title:
          'Top 9 Google Competitors &amp; Alternatives In 2022 - COFES.COM',
        description:
          "Here are some of <b>Google's</b> main <b>competitors</b>: #1. Yahoo. Founded: January 1994. Headquarters: Sunnyvale, California. Need to know. Yahoo ( https://www.yahoo.com )was founded in 1994 by David Filo and Jerry Yang. It was one of the first companies to use the Internet in the 1990s.",
        rawDescription:
          'Here are some of <b>Google&#x27;s</b> main <b>competitors</b>: #1. Yahoo. Founded: January 1994. Headquarters: Sunnyvale, California. Need to know. Yahoo ( https://www.yahoo.com )was founded in 1994 by David Filo and Jerry Yang. It was one of the first companies to use the Internet in the 1990s.',
        hostname: 'cofes.com',
        icon: 'https://external-content.duckduckgo.com/ip3/cofes.com.ico',
        url: 'https://cofes.com/google-competitors/',
      },
      {
        title: '10 Of Google&#x27;s Biggest Competitors - Eskify',
        description:
          "Apple is obviously among <b>Google's</b> biggest <b>competitors</b> in regard to the smartphone market. <b>Google</b> has been hacking away at Apple's dominance of that industry for years. In fact, it even caused Steve Jobs to swear he would destroy Microsoft for making attempts to do a similar thing.",
        rawDescription:
          'Apple is obviously among <b>Google&#x27;s</b> biggest <b>competitors</b> in regard to the smartphone market. <b>Google</b> has been hacking away at Apple&#x27;s dominance of that industry for years. In fact, it even caused Steve Jobs to swear he would destroy Microsoft for making attempts to do a similar thing.',
        hostname: 'eskify.com',
        icon: 'https://external-content.duckduckgo.com/ip3/eskify.com.ico',
        url: 'http://eskify.com/10-googles-biggest-competitors/',
      },
    ],
  };

  const robotsTxt = `
    User-agent: *
    Disallow: *=*
    Allow: /thmb/*
    Allow: *utm_medium=social*
    Allow: *url=*
    Allow: *externalComponentService=*
    Allow: *utm_medium=pinterest*
    Allow: *_ga=*
    Allow: *?amp=*
    Disallow: *.pdf
    Disallow: *globeTest_*
    Disallow: *quizResult=*
    Disallow: *globeNoTest
    Disallow: *globeResourceConcat
    Disallow: *globeTest_optimizelyInclusion
    Disallow: *?kw*
    Disallow: *hid=*
    Allow:*/search*
    Allow:*?partner*
    Allow:*?tvwidgetsymbol*
    Allow:*?lgl*
    Allow:*?utm_term*
    Allow:?utm_content*
    Allow:*?utm_campaign*
    Allow:*?utm_medium*
    Allow:*?utm_source*
    Allow:*?d_pv*
    Allow:*?yptr*
    User-agent: Pinterest
    Disallow:
    User-agent: Pinterestbot
    Disallow:
    Sitemap: ${baseUrl}/sitemap.xml
    Sitemap: ${baseUrl}/google-news-sitemap.xml
    `;

  const disallowRobotsTxt = `
    User-agent: *
    Disallow: *
    `;

  let logger;
  let searchEngine;
  let reqLib;
  let subject;
  beforeEach(() => {
    searchEngine = {
      search: sinon.stub(),
      SafeSearchType: {
        STRICT: DDG.SafeSearchType.STRICT,
      },
    };
    reqLib = {
      get: sinon.stub(),
    };
    logger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    searchEngine.search.returns(uncheckedSites);
    reqLib.get.returns({
      data: disallowRobotsTxt,
    });
    reqLib.get.withArgs(`${baseUrl}/robots.txt`).returns({
      data: robotsTxt,
    });

    subject = new DataScraper(logger);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('scrapeData', () => {
    it('should return the subject', async () => {
      const target = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      const actual = await subject.scrapeData(target, searchEngine, reqLib);
      expect(actual.subject).to.equal(target);
    });

    it('should return owned companies', async () => {
      chai.assert.fail(`Needs implementation`);
    });

    it('should return competitors', async () => {
      chai.assert.fail(`Needs implementation`);
    });

    it('should return products', async () => {
      chai.assert.fail(`Needs implementation`);
    });

    it('should return services', async () => {
      chai.assert.fail(`Needs implementation`);
    });

    it('should return executives', async () => {
      chai.assert.fail(`Needs implementation`);
    });

    it('should return sectors', async () => {
      chai.assert.fail(`Needs implementation`);
    });
  });

  describe('_webSites', () => {
    it('should throw an error if an invalid search subject is applied', async () => {
      const searchSubject = {name: 'Google', type: 'GOOGLE'};
      await expect(
        subject._webSites(searchSubject, searchEngine, reqLib)
      ).to.be.rejectedWith(Error);
    });

    it('should fail if an invalid search engine is supplied', async () => {
      const searchSubject = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });
      await expect(
        subject._webSites(searchSubject, {}, reqLib)
      ).to.be.rejectedWith(Error);
    });

    it('should only return sites that allow web scraping', async () => {
      const searchSubject = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });

      const scrapableSites = await subject._webSites(
        searchSubject,
        searchEngine,
        reqLib
      );

      console.log(`ScrapableSites: ${JSON.stringify(scrapableSites)}`);

      expect(Array.isArray(scrapableSites)).to.equal(true);
      expect(scrapableSites.length).to.equal(1);
      expect(scrapableSites).to.include(
        `${baseUrl}/ask/answers/120314/who-are-googles-goog-main-competitors.asp`
      );
    });

    it('should perform a strict safe search', async () => {
      const searchSubject = EconomicEntityFactory.get({
        name: 'Google',
        type: EconomicEntityType.Business,
      });

      await subject._webSites(searchSubject, searchEngine, reqLib);

      const searchOptions = searchEngine.search.getCall(0).args[1];
      expect(searchOptions.safeSearch).to.equal(DDG.SafeSearchType.STRICT);
    });
  });
});
