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
   * @return {Object} Scraped data.
   */
  async scrapeData(subject) {
    await this._webSites(subject);

    // TODO
    // const data = this._scrapeData(subject, sites);

    // TODO
    // return this._reduceScrapedData(data);
  }

  /**
   * Gather safe websites.
   * @param {Object} subject Economic entity.
   * @param {Object} [searchEngine = DDG] Search engine to use.
   * @param {Object} [reqLib = axios] Library with which requests will be made.
   * @return {Array<Object>} Websites.
   */
  async _webSites(subject, searchEngine = DDG, reqLib = axios) {
    if (!validEconomicEntities([subject])) {
      throw new Error(`Subject was invalid. \n${JSON.stringify(subject)}`);
    }

    if (!searchEngine || Object.keys(searchEngine).length <= 0) {
      throw new Error(
        `Search engine was invalid. \n${JSON.stringify(searchEngine)}`
      );
    }

    const scrapableSites = [];
    for (const field of subject.relationships) {
      const searchResult = await searchEngine.search(
        `${subject.type.toLowerCase()} ${subject.name} ${field.toLowerCase()}`,
        {
          safeSearch: searchEngine.SafeSearchType.STRICT,
        }
      );

      if (searchResult.noResults) continue;

      for (const result of searchResult.results) {
        const hostname = result.hostname || '';
        if (!hostname) continue;

        const baseUrl = `https://${hostname}`;
        const robotsTxt = await this._robotsDotText(baseUrl, reqLib);

        if (!robotsTxt) continue;

        const dataUrl = result.url || '';
        if (!dataUrl) continue;

        const robots = robotsParser(baseUrl, robotsTxt);

        if (!robots.isAllowed(dataUrl, 'duckduckbot')) continue;

        this._logger.debug(`Allowing scraping of site: ${dataUrl}`);

        scrapableSites.push(dataUrl);
      }
    }

    return scrapableSites;
  }

  /**
   * Get the robots.txt.
   * @param {String} baseUrl
   * @return {String} Robots.txt as a string or ''.
   */
  async _robotsDotText(baseUrl) {
    try {
      const packet = await axios.get(`${baseUrl}/robots.txt`);
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
