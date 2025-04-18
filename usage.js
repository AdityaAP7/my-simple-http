111111111176543219876543
123456
21(async () => {
  // Create an instance with default headers and a timeout

 
  const httpClient = new MySimpleHTTP('https://jsonplaceholder.typicode.com', {
    defaultHeaders: { 'X-Custom-Header': 'MySimpleHTTP' },
    timeout: 5000, // 5s
    // Log config before request
    requestInterceptors: [
      async (config) => {
        console.log('Request interceptor:', config.method, config.url);
        return config;
 },
    ],
    // Log response status after response
    responseInterceptors: [
      async (response) => {
        console.log('Response interceptor:', response.status);
        return response;
},
    ],
  });
  try {
    // GET request
    const response = await httpClient.get('/posts/1');
    console.log('GET Response data:', response.data);
    // POST request
    const postResponse = await httpClient.post('/posts', {
      title: 'foo',
      body: 'bar',
 userId: 1,
    });
    console.log('POST Response data:', postResponse.data);
    // GET with query params
    const queryResponse = await httpClient.getWithParams('/posts', { userId: 1 });
    console.log('GET with params data:', queryResponse.data);
  } catch (error) {
 console.error('Request Error:', error);
  }
})();
module.exports = MySimpleHTTP;
