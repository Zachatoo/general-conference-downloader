const { handler } = require('./handler');

const event = {
    httpMethod: 'GET',
}

async function init () {
    const response = await handler(event);
    console.log(response);
}

init();