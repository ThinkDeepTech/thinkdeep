import {DataCollector} from './data-collector.js';
import {CollectionOperationType} from '@thinkdeep/model';

/**
 * Class holding all accessible operations.
 *
 * NOTE: OPERATIONS SHOULD ONLY BE ACCESSED THROUGH THIS CLASS.
 */
class Operations {
  /**
   * Fetch tweets operation.
   *
   * @param {Object} economicEntity Economic entity subject.
   * @return {Operation} Frozen operation to perform.
   */
  FetchTweets(economicEntity) {
    return Object.freeze(
      new DataCollector(economicEntity, CollectionOperationType.FetchTweets)
    );
  }

  /**
   * Scrape data operation.
   *
   * @param {Object} economicEntity Economic entity subject.
   * @return {Operation} Frozen operation to perform.
   */
  ScrapeData(economicEntity) {
    return Object.freeze(
      new DataCollector(economicEntity, CollectionOperationType.ScrapeData)
    );
  }
}

const operations = new Operations();

export {operations as Operations};
