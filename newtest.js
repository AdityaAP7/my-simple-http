// test.js
const MySimpleHTTP = require('./index');
async function testClient() {
  const client = new MySimpleHTTP('https://jsonplaceholder.typicode.com');
  try {
    // Example: GET request
    const response = await client.get('/posts/1');
    console.log('GET /posts/1 Response:', response.data);
    // Example: POST request
