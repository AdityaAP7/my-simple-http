const MySimpleHTTP = require('./index');
const BASE_URL = 'https://jsonplaceholder.typicode.com';
const client = new MySimpleHTTP(BASE_URL);
async function testClient() {
  try {
    console.log('--- Testing GET ---');
    const getResponse = await client.get('/posts/1');
    console.log('GET /posts/1 Response:', getResponse.data);
    console.log('--- Testing POST ---');
    const createResponse = await client.post('/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1,
    });
    console.log('POST /posts Response:', createResponse.data);
    console.log('--- Testing PUT ---');
    const updateResponse = await client.put('/posts/1', {
      id: 1,
      title: 'foo-updated',
      body: 'bar-updated',
      userId: 1,
    });
    console.log('PUT /posts/1 Response:', updateResponse.data);
    console.log('--- Testing PATCH ---');
      id: 1,
      title: 'foo-updated',
      body: 'bar-updated',
      userId: 1,
    });
    console.log('PUT /posts/1 Response:', updateResponse.data);
