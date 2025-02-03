(async () => {
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
