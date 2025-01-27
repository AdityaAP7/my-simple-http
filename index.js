
// index.js
const https = require('https');
const http = require('http');
const urlModule = require('url');
class MySimpleHTTP {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }
/**
   * Generic request method
 * @param {Object} config
   * @param {String} config.method - HTTP method (GET, POST, etc.)
   * @param {String} config.url - Request URL (path part only if baseURL is used)
   * @param {Object} [config.headers] - Request headers
   * @param {Object|String} [config.data] - Request body for POST, PUT, PATCH
   */
  request(config) {
    return new Promise((resolve, reject) => {
      // Merge baseURL with the provided url
      const fullURL = this.baseURL
        ? new URL(config.url, this.baseURL).toString()

        : config.url;
      const parsedURL = urlModule.parse(fullURL);
      const options = {
        hostname: parsedURL.hostname,
        port: parsedURL.port || (parsedURL.protocol === 'https:' ? 443 : 80),
        path: parsedURL.path,
        method: config.method,
        headers: config.headers || {},
