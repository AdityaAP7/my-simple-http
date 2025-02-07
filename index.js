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
        // Construct full URL
        const fullURL = this.baseURL
          ? new URL(finalConfig.url, this.baseURL).toString()
          : finalConfig.url;
        const parsedURL = urlModule.parse(fullURL);
        const options = {
          hostname: parsedURL.hostname,
          port: parsedURL.port || (parsedURL.protocol === 'https:' ? 443 : 80),
          path: parsedURL.path,
          method: finalConfig.method,
     headers: finalConfig.headers,
        };
        if (finalConfig.data && !options.headers['Content-Type']) {
options.headers['Content-Type'] = 'application/json';
        }
        const transport = parsedURL.protocol === 'https:' ? https : http;
        return new Promise((resolve, reject) => {
          const req = transport.request(options, (res) => {
            let responseData = '';

                                      res.on('data', (chunk) => {
                            responseData += chunk;
   });
            res.on('end', async () => {
 try {
                responseData = JSON.parse(responseData);
     } catch (err) {
                // If not valid JSON, leave it as a string
              }
              const response = {
                data: responseData,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                config: finalConfig,
 request: req,
              };
              for (const interceptor of this.responseInterceptors) {
 response = await interceptor(response);
              }
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(response);
              } else {
 resolve(response); // Handle non-2xx status codes here as needed
              }
            });
          });
          req.on('error', (err) => {
  reject(err);
          });
          if (this.timeout > 0) {
            req.setTimeout(this.timeout, () => {
              req.destroy(new Error('Request timed out'));
  });
          }
          if (finalConfig.data) {
 req.write(typeof finalConfig.data === 'object' ? JSON.stringify(finalConfig.data) : finalConfig.data);
          }
          req.end();
  });
      } catch (error) {
        if (retries < this.maxRetries) {
          console.log(`Retrying request... (${retries + 1})`);
          await this._delay(this.retryDelay);
          return attemptRequest(retries + 1);
 }
        if (this.globalErrorHandler) {
  this.globalErrorHandler(error);
}

        throw error;
      }
    };
    return attemptRequest(0);
 }
 /**
   * Adds a delay (in ms)
   * @param {Number} ms
 * @returns {Promise}
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
 }
Shorthand methods
  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }
  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
}  put(url, data, config = {}) {

    return this.request({ ...config, method: 'PUT', url, data });
  }
  patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
 }
  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
 /**
   * Helper to build query strings and append to URL easily
   * @param {String} url - base path
 * @param {Object} params - query params
   */
  buildURLWithParams(url, params = {}) {
    const urlObj = new URL(url, this.baseURL);
    Object.keys(params).forEach((key) => {
      urlObj.searchParams.append(key, params[key]);
    });
    return urlObj.toString();
 }
/**
   * Convenience method to do GET with query params
   * @param {String} url
   * @param {Object} params - query params
   * @param {Object} config
 * @returns {Promise<Object>}
   */
  getWithParams(url, params = {}, config = {}) {
    const fullURL = this.buildURLWithParams(url, params);
    return this.get(fullURL, config);
  }
  /**
   * Utility to upload files
   * @param {String} url - The URL where to upload the file
   * @param {Object} file - The file to upload (must be a `fs` file stream or buffer)
   * @param {Object} config - Additional configuration
   * @returns {Promise<Object>}
   */
  async uploadFile(url, file, config = {}) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
  },
    });
  }
  /**
   * Utility for basic authentication
   * @param {String} username
   * @param {String} password
   * @returns {String} - Basic Auth header value
*/
  static basicAuth(username, password) {
    const authValue = Buffer.from(`${username}:${password}`).toString('base64');
