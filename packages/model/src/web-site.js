import {validString, validUrl} from './helpers.js';

/**
 * Web site object.
 */
class WebSite {
  /**
   * Constructor.
   * @param {String} url Website url.
   * @param {String} body Body of the web site.
   */
  constructor(url, body) {
    if (!validUrl(url)) {
      throw new Error(`Url ${url} is invalid.`);
    }

    if (!validString(body)) {
      throw new Error(`The body ${body} is invalid.`);
    }

    this.url = url;
    this.body = body;
  }

  /**
   * Convert to a plain javascript object.
   * @return {Object} Plain frozen object.
   */
  toObject() {
    return Object.freeze({
      url: this.url,
      body: this.body,
    });
  }

  /**
   * Get the string representation.
   * @return {String} String representation.
   */
  toString() {
    return JSON.stringify(this);
  }

  /**
   * Check validity.
   * @return {Boolean} True if valid. False otherwise.
   */
  valid() {
    return validUrl(this.url) && validString(this.body);
  }

  /**
   * Get the graphql type definition string for a graphql schema.
   * @return {String} The type definition.
   */
  graphQLTypeDefinition() {
    return `
            type ${this.graphQLType()} {
                url: String!
                body: String
            }
        `;
  }

  /**
   * Get the graphql type name string for a graphql schema.
   * @return {String} The type name.
   */
  graphQLType() {
    return 'WebSite';
  }
}

/**
 * Convert many web sites to objects.
 * @param {Array<EconomicEntity>} subjects
 * @return {Array<Object>} Resultant objects.
 */
const objectifyWebSites = (subjects) => {
  if (!validWebSites(subjects)) {
    throw new Error(`Web sites provided were invalid.`);
  }

  const objects = [];
  for (const subject of subjects) {
    objects.push(subject.toObject());
  }

  return objects;
};

/**
 * Check validity of an arbitrary object.
 * @param {WebSite} subject
 * @return {Boolean} True if valid. False otherwise.
 */
const validWebSite = (subject) => {
  return typeof subject.valid === 'function' && subject.valid();
};

/**
 * Check validity of multiple objects.
 * @param {Array<WebSite>} subjects
 * @return {Boolean} True if valid. False otherwise.
 */
const validWebSites = (subjects) => {
  for (const subject of subjects) {
    if (!validWebSite(subject)) {
      return false;
    }
  }

  return true;
};

export {WebSite, validWebSites, objectifyWebSites};
