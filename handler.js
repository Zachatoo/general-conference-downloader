var https = require('https');
var fs = require('fs');

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
    await fetchConferenceTalk(conference, fileName);
    console.log('22');
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

async function fetchConferenceTalk(conference, fileName) {
  const url = `https://media2.ldscdn.org/assets/general-conference/${conference}/${fileName}`;
  const destination = `./temp/${fileName}`;
  let file = fs.createWriteStream(destination);
  // download(url, destination, (file) => {
  //   console.log('file', file);
  // });
  try {
      const request = await https.get(url);
      request.pipe(file);
      file.on('finish', () => file.close());
  } catch {
      fs.unlink(fileName);
  }
}

var download = function (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
