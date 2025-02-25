const MySimpleHTTP = require('./index');
const BASE_URL = 'https://jsonplaceholder.typicode.com';
const client = new MySimpleHTTP(BASE_URL);
async function testClient() {
