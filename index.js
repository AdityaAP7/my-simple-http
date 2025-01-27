
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
  };
      // If we are sending a JSON body and no 'Content-Type' is set, default it
      if (config.data && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
}
      // Decide whether to use http or https
      const transport = parsedURL.protocol === 'https:' ? https : http;
      const req = transport.request(options, (res) => {
        let responseData = '';
        // Collect data
        res.on('data', (chunk) => {
 responseData += chunk;
        });
        // Response ended
        res.on('end', () => {
          // Attempt to parse as JSON, fallback to raw string if it fails
          try {
            responseData = JSON.parse(responseData);
          } catch (err) {
