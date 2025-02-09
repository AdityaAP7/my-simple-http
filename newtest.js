
// test.js
const MySimpleHTTP = require('./index');
async function testClient() {
  const client = new MySimpleHTTP('https://jsonplaceholder.typicode.com');
  try {
    // Example: GET request
