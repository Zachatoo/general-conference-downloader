import { handler } from './index.js';

const event = {
    httpMethod: 'GET',
}

/**
 * Simulate AWS API Gateway for local testing.
 */
async function init () {
    const response = await handler(event);
    console.log(response.body);
    // console.log('headers', response.headers);
    console.log('status', response.statusCode);
}

init();