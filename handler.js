const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 */
exports.handler = async (event, context) => {
  let body = getRandomConferenceSlug();
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    if (event.httpMethod !== 'GET') {
      throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
    const conference = 'october-2021-general-conference';
    const fileName = '2021-10-1010-russell-m-nelson-32k-eng.mp3';
    const data = await downloadFile(conference, fileName);
    console.log('data', data);
    body = fs.readFileSync(`./temp/${fileName}`, { encoding: 'utf-8' });
  } catch (err) {
    statusCode = '400';
    body = err.message;
  } finally {
    // if (typeof body !== 'string') {
    //     body = JSON.stringify(body);
    // }
  }

  return {
    statusCode,
    body,
    headers,
  };
};

function getRandomConferenceSlug() {
  const months = ['april', 'october'];
  const randomMonthInt = Math.random() < 0.5 ? 0 : 1;
  return months[randomMonthInt];
}

async function downloadFile (conference, fileName) {
  const url = `https://media2.ldscdn.org/assets/general-conference/${conference}/${fileName}`;
  const destination = path.resolve(__dirname, 'temp', fileName);
  
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  response.data.pipe(fs.createWriteStream(destination));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve();
    });
    response.data.on('error', () => {
      reject();
    });
  });
}
