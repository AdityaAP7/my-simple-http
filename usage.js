(async () => {
  // Create an instance with default headers and a timeout

 
  const httpClient = new MySimpleHTTP('https://jsonplaceholder.typicode.com', {
    defaultHeaders: { 'X-Custom-Header': 'MySimpleHTTP' },
