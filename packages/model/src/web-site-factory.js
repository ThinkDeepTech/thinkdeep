import {WebSite} from './web-site.js';
import {validString, validUrl} from './helpers.js';

/**
 * Factory providing access to economic entity objects.
 */
class WebSiteFactory {
  /**
   * Get one or multiple.
   * @param {Array<Object> | Object} data Entry of the form { url: <url>, body?: <body>} or an array of such entities.
   * @return {Array<WebSite> | WebSite} Immutable entity or array of such objects.
   */
  static get(data) {
    return Array.isArray(data) ? this._webSites(data) : this._webSite(data);
  }

  /**
   * Get one.
   * @param {Object} obj Entry of the form { url: <url>, body?: <body>}.
   * @param {String} obj.url Web site url.
   * @param {String} obj.body Web site body.
   * @return {WebSite} Immutable entity.
   */
  static _webSite(obj) {
    if (!validUrl(obj.url)) {
      throw new Error(`Url ${obj.url} is invalid.`);
    }

    if (!validString(obj.body)) {
      throw new Error(`Body ${obj.body} is invalid.`);
    }

    return Object.freeze(new WebSite(obj.url, obj.body));
  }

  /**
   * Fetch an array of entities.
   * @param {Array<Object>} subjects Array of objects of the form { url: <url>, body?: <body>}.
   * @return {Array<WebSite>} Entities or [].
   */
  static _webSites(subjects) {
    if (!Array.isArray(subjects)) {
      throw new Error(`${JSON.stringify(subjects)} is not a valid array.`);
    }

    const entities = [];
    for (const subject of subjects) {
      entities.push(this._economicEntity(subject));
    }

    return entities;
  }
}

export {WebSiteFactory};
