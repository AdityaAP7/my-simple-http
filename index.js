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
    this.baseURL = baseURL;
    this.defaultHeaders = options.defaultHeaders || {};
    this.timeout = options.timeout || 0;
    // Each interceptor is a function that takes the config/response and returns it (or throws).
    this.requestInterceptors = options.requestInterceptors || [];
    this.responseInterceptors = options.responseInterceptors || [];
  }
 /**
   * Generic request method
   * @param {Object} config
   * @param {String} config.method - HTTP method (GET, POST, etc.)
   * @param {String} config.url - Request URL (path part only if baseURL is used)
   * @param {Object} [config.headers] - Request headers
   * @param {Object|String} [config.data] - Request body for POST, PUT, PATCH
   * @returns {Promise<Object>} - Axios-like response object
   */
  async request(config) {
    // ---- 1. Run request interceptors (if any)
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
 finalConfig = await interceptor(finalConfig);
    }
    // Merge default headers
    finalConfig.headers = {
           ...this.defaultHeaders,

 ...(finalConfig.headers || {}),
    };
    return new Promise((resolve, reject) => {
           // Construct full URL

      const fullURL = this.baseURL
        ? new URL(finalConfig.url, this.baseURL).toString()
 // Parse URL
      const parsedURL = urlModule.parse(fullURL);
      const options = {
        hostname: parsedURL.hostname,
        port: parsedURL.port || (parsedURL.protocol === 'https:' ? 443 : 80),
        path: parsedURL.path,
        method: finalConfig.method,
        headers: finalConfig.headers,
      };
      // If we are sending a JSON body and no 'Content-Type' is set, default it
      if (finalConfig.data && !options.headers['Content-Type']) {
 options.headers['Content-Type'] = 'application/json';
      }
      // Decide whether to use http or https
      const transport = parsedURL.protocol === 'https:' ? https : http;
      // Create the request
      const req = transport.request(options, (res) => {
        let responseData = '';
        // Collect data
        res.on('data', (chunk) => {
 responseData += chunk;
});
        // Response ended
        res.on('end', () => {
          // Attempt to parse as JSON, fallback to raw string if it fails
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
       // If it’s not valid JSON, we leave it as a string
          }
          // Construct a similar response shape as Axios
          const response = {
            data: responseData,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            config: finalConfig,
 request: req,
          };
          // ---- 2. Run response interceptors (if any)
          (async () => {
            for (const interceptor of this.responseInterceptors) {
              response = await interceptor(response);
}

            // Resolve or reject based on status code
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              // Optionally, you could reject if non-2xx:
              // reject(new Error(`Request failed with status code ${res.statusCode}`));
              // or just resolve to handle it outside
              resolve(response);
    }
          })().catch(reject);
  });
      });
      // Handle errors
      req.on('error', (err) => {
   reject(err);
      });
      // Handle timeout if specified
      if (this.timeout > 0) {
        req.setTimeout(this.timeout, () => {
          req.destroy(new Error('Request timed out'));
  });
      }
      // Write request data if available
      if (finalConfig.data) {
        if (typeof finalConfig.data === 'object') {
          req.write(JSON.stringify(finalConfig.data));
 } else {
          req.write(finalConfig.data);
        }
      }
 // End the request
      req.end();
    });
  }
  /**
   * Shorthand methods
   */
  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }
  post(url, data, config = {}) {
 return this.request({ ...config, method: 'POST', url, data });
  }
  put(url, data, config = {}) {
 return this.request({ ...config, method: 'PUT', url, data });
  }
  patch(url, data, config = {}) {
return this.request({ ...config, method: 'PATCH', url, data });
  }
  delete(url, config = {}) {  return this.request({ ...config, method: 'DELETE', url });
  }
/**
   * Helper to build query strings and append to URL easily
   * @param {String} url - base path
   * @param {String} url - base path
   * @param {Object} params - query params   */
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
}
// ---------------------------
// Example usage:
// ---------------------------
/*
(async () => {
  // Create an instance with default headers and a timeout
  const httpClient = new MySimpleHTTP('https://jsonplaceholder.typicode.com', {
    defaultHeaders: { 'X-Custom-Header': 'MySimpleHTTP' },
    timeout: 5000, // 5s
    // Log config before request
    requestInterceptors: [
      async (config) => {
