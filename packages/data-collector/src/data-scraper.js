import {validEconomicEntities} from '@thinkdeep/model';
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
    const sites = await this._webSites(
      subject,
      searchEngine,
      reqLib,
      robotsTxtParser
    );

    // TODO
    const data = this._scrapeData(subject, sites);

    // TODO
    return this._reduceScrapedData(data);
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

    const scrapableSites = [];
    for (const field of subject.relationships || []) {
      const searchResults = await this._search(subject, field, searchEngine);

      for (const searchResult of searchResults || []) {
        const allowsScraping = await this._allowsScraping(
          searchResult,
          reqLib,
          robotsTxtParser
        );
        if (allowsScraping) {
          scrapableSites.push(searchResult.url);
        }
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
   * Determine whether a website allows scraping of a search engine result.
   * @param {Object} searchResult The search engine search result.
   * @param {Function} [reqLib = axios] Request library to use.
   * @param {Function} [robotsTxtParser = robotsParser] Robots txt parser to use.
   * @return {Boolean} True if scraping is acceptable. False otherwise.
   */
  async _allowsScraping(
    searchResult,
    reqLib = axios,
    robotsTxtParser = robotsParser
  ) {
    const hostname = searchResult.hostname || '';
    if (!hostname) return false;

    const baseUrl = `https://${hostname}`;
    const robotsTxt = await this._robotsDotText(baseUrl, reqLib);

    if (!robotsTxt) return false;

    const dataUrl = searchResult.url || '';
    if (!dataUrl) return false;

    const robots = robotsTxtParser(baseUrl, robotsTxt);

    return robots.isAllowed(dataUrl, 'duckduckbot');
  }

  /**
   * Get the robots.txt.
   * @param {String} baseUrl
   * @param {Object} [reqLib = axios] Library with which requests will be made.
   * @return {String} Robots.txt as a string or ''.
   */
  async _robotsDotText(baseUrl, reqLib = axios) {
    try {
      const packet = await reqLib.get(`${baseUrl}/robots.txt`);

      this._logger.debug(
        `Received robots.txt for url ${baseUrl}\n\n${packet.data}\n\n`
      );

      return packet.data;
    } catch (e) {
      this._logger.warn(
        `Failed to fetch robots.txt from url ${baseUrl}\n${e.message}`
      );
      return '';
    }
  }

  /**
   * Scrape data for associated subject.
   * @param {Object} subject Economic entity.\
   * @param {Array<Object>} sites Websites to target.
   * @return {Object} Scraped data.
   */
  _scrapeData(subject, sites) {
    return {subject};
  }

  /**
   * Reduce scraped data.
   * @param {Object} data Scraped data.
   * @return {Object} Reduced data.
   */
  _reduceScrapedData(data) {
    return data;
  }
}

export {DataScraper};
