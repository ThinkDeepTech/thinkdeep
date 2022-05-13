import {DataCollector} from './data-collector.js';

/**
 * Class holding all accessible operations.
 *
 * NOTE: OPERATIONS SHOULD ONLY BE ACCESSED THROUGH THIS CLASS.
 */
class Operations {
  /**
   * Fetch tweets operation.
   *
   * @param {String} entityName Name of the economic entity (i.e, Google).
   * @param {String} entityType Type of the economic entity (i.e, BUSINESS).
   * @return {Operation} Frozen operation to perform.
   */
  FetchTweets(entityName, entityType) {
    return Object.freeze(
      new DataCollector(entityName, entityType, 'fetch-tweets')
    );
  }
}

const operations = new Operations();

export {operations as Operations};
