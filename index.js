const https = require('https');
const http = require('http');
const urlModule = require('url');
class MySimpleHTTP {
 /**
   * @param {String} [baseURL=''] - Base URL for all requests
   * @param {Object} [options={}] - Additional options
   * @param {Object} [options.defaultHeaders={}] - Headers to send with every request
   * @param {Number} [options.timeout=0] - Timeout for requests in milliseconds (0 = no timeout)
   * @param {Array<Function>} [options.requestInterceptors=[]] - Functions to intercept request configs
   * @param {Array<Function>} [options.responseInterceptors=[]] - Functions to intercept responses
   */
  constructor(baseURL = '', options = {}) {
