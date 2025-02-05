const https = require('https');
const http = require('http');
const urlModule = require('url');
const querystring = require('querystring');
const fs = require('fs');
const { URL } = require('url');
class MySimpleHTTP {
 /**
   * @param {String} [baseURL=''] - Base URL for all requests
   * @param {Object} [options={}] - Additional options
   * @param {Object} [options.defaultHeaders={}] - Headers to send with every request
   * @param {Number} [options.timeout=0] - Timeout for requests in milliseconds (0 = no timeout)
   * @param {Array<Function>} [options.requestInterceptors=[]] - Functions to intercept request configs
   * @param {Array<Function>} [options.responseInterceptors=[]] - Functions to intercept responses
   * @param {Number} [options.maxRetries=3] - Maximum number of retries on failure
   * @param {Number} [options.retryDelay=1000] - Delay (in ms) between retries
   */
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = options.defaultHeaders || {};
    this.timeout = options.timeout || 0;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.requestInterceptors = options.requestInterceptors || [];
    this.responseInterceptors = options.responseInterceptors || [];
 this.globalErrorHandler = options.globalErrorHandler || null; // Optional global error handler
  }
/**
   * Generic request method
   * @param {Object} config
   * @param {String} config.method - HTTP method (GET, POST, etc.)
   * @param {String} config.url - Request URL (path part only if baseURL is used)
   * @param {Object} [config.headers] - Request headers
   * @param {Object|String} [config.data] - Request body for POST, PUT, PATCH
   * @param {Number} [config.retries] - Custom number of retries for this request
   * @returns {Promise<Object>} - Axios-like response object
   */
  async request(config) {
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
   finalConfig = await interceptor(finalConfig);
    }
    finalConfig.headers = {
      ...this.defaultHeaders,

        ...(finalConfig.headers || {}),
    };
    const attemptRequest = async (retries) => {
      try {
