
// index.js
const https = require('https');
const http = require('http');
const urlModule = require('url');
class MySimpleHTTP {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }
