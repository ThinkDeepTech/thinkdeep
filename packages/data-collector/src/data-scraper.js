import {validEconomicEntities, WebSiteFactory} from '@thinkdeep/model';
import axios from 'axios';
import DDG from 'duck-duck-scrape';
import robotsParser from 'robots-parser';

/**
 * Data scraper responsible for gathering data from the web.
 */
class DataScraper {
  /**
   * Constructor function.
   * @param {Object} logger Logger to use.
   */
  constructor(logger) {
    this._logger = logger;

    this._logger.debug(`Initializing data scraper.`);
  }

  /**
   * Scrape data for the associated subject.
   * @param {Object} subject Economic entity.
   * @param {Object} [searchEngine = DDG] Search engine to use.
   * @param {Function} [reqLib = axios] Library with which requests will be made.
   * @param {Object} [robotsTxtParser = robotsParser] Parser to use to parse robots.txt.
   * @return {Object} Scraped data.
   */
  async scrapeData(
    subject,
    searchEngine = DDG,
    reqLib = axios,
    robotsTxtParser = robotsParser
  ) {
    const urls = await this._webSites(
      subject,
      searchEngine,
      reqLib,
      robotsTxtParser
    );

    return this._scrapeData(subject, urls, reqLib);
  }

  /**
   * Gather safe websites.
   * @param {Object} subject Economic entity.
   * @param {Object} [searchEngine = DDG] Search engine to use.
   * @param {Function} [reqLib = axios] Library with which requests will be made.
   * @param {Object} [robotsTxtParser = robotsParser] Parser to use to parse robots.txt.
   * @return {Array<Object>} Scrapable websites or [].
   */
  async _webSites(
    subject,
    searchEngine = DDG,
    reqLib = axios,
    robotsTxtParser = robotsParser
  ) {
    if (!validEconomicEntities([subject])) {
      throw new Error(`Subject was invalid. \n${JSON.stringify(subject)}`);
    }

    if (!searchEngine || Object.keys(searchEngine).length <= 0) {
      throw new Error(
        `Search engine was invalid. \n${JSON.stringify(searchEngine)}`
      );
    }

    if (typeof robotsTxtParser !== 'function') {
      throw new Error(
        `Robots text parser was invalid. \n${JSON.stringify(robotsTxtParser)}`
      );
    }

    const scrapableSites = [];
    for (const field of subject.relationships || []) {
      const searchResults = await this._search(subject, field, searchEngine);

      for (const searchResult of searchResults || []) {
        const shouldScrape = await this._shouldScrape(
          searchResult,
          reqLib,
          robotsTxtParser
        );

        if (!shouldScrape) {
          this._logger.debug(`Disabling scraping for url ${searchResult.url}`);
          continue;
        }

        this._logger.debug(`Enabling scraping for url ${searchResult.url}`);
        scrapableSites.push(searchResult.url);
      }
    }

    return scrapableSites;
  }

  /**
   * Search a search engine for relevant websites.
   * @param {Object} subject Economic entity.
   * @param {String} field The search field.
   * @param {Object} [searchEngine = DDG] Search engine to use.
   * @return {Array<Object>} Search engine search results or [].
   */
  async _search(subject, field, searchEngine = DDG) {
    const searchResult = await searchEngine.search(
      `${subject.type.toLowerCase()} ${subject.name} ${field.toLowerCase()}`,
      {
        safeSearch: searchEngine.SafeSearchType.STRICT,
      }
    );

    if (searchResult.noResults || !Array.isArray(searchResult.results))
      return [];

    return searchResult.results;
  }

  /**
   * Determine whether a website should be scraped.
   * @param {Object} searchResult The search engine search result.
   * @param {Function} [reqLib = axios] Request library to use.
   * @param {Function} [robotsTxtParser = robotsParser] Robots txt parser to use.
   * @return {Boolean} True if scraping is acceptable. False otherwise.
   */
  async _shouldScrape(
    searchResult,
    reqLib = axios,
    robotsTxtParser = robotsParser
  ) {
    const hostname = searchResult.hostname || '';
    if (!hostname) return false;

    const baseUrl = `https://${hostname}`;
    const robotsTxt = await this._get(`${baseUrl}/robots.txt`, reqLib);

    if (!robotsTxt) return false;

    const dataUrl = searchResult.url || '';
    if (!dataUrl) return false;

    const robots = robotsTxtParser(baseUrl, robotsTxt);

    return robots.isAllowed(dataUrl, 'duckduckbot');
  }

  /**
   * Get web content.
   * @param {String} url
   * @param {Object} [reqLib = axios] Library with which requests will be made.
   * @return {String} Url content as a string or ''.
   */
  async _get(url, reqLib = axios) {
    try {
      const packet = await reqLib.get(url);

      return packet.data;
    } catch (e) {
      this._logger.warn(
        `Failed to fetch content from url ${url}\n${e.message}`
      );
      return '';
    }
  }

  /**
   * Scrape data for associated subject.
   * @param {Object} subject Economic entity.
   * @param {Array<String>} urls Websites to target.
   * @param {Object} [reqLib = axios] Library with which requests will be made.
   * @return {Object} Scraped data || [].
   */
  async _scrapeData(subject, urls, reqLib = axios) {
    const results = [];
    for (const url of urls) {
      const data = await this._get(url);

      if (!data) continue;

      results.push(WebSiteFactory.get({url, body: data}));
    }

    return results;
  }

  /**
   * Reduce scraped data.
   * @param {Object} data Scraped data.
   * @return {Object} Reduced data.
   */
  _reduceScrapedData(data) {
    // TODO
    return data;
  }
}

export {DataScraper};