
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
