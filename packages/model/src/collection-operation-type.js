/**
 * Collection operation types.
 */
class CollectionOperationType {
  /**
   * Fetch tweets operation type.
   * @return {String} Operation type name.
   */
  static get FetchTweets() {
    return 'fetch-tweets';
  }

  /**
   * Scrape web operation type.
   * @return {String} Operation type name.
   */
  static get ScrapeData() {
    return 'scrape-web';
  }

  /**
   * Get the operation types.
   * @return {Array<String>} Operation type names.
   */
  static get types() {
    return [this.FetchTweets, this.ScrapeData];
  }
}

export {CollectionOperationType};
