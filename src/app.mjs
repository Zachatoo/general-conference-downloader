import { promises as fsPromises, existsSync, mkdirSync, createWriteStream } from 'fs';
import { resolve } from 'path';
import axios from 'axios';

export class App {
  constructor(event, context) {
    return this.init(event, context);
  }

  async init (event, context) {
    let body;
    let statusCode = '200';
    let headers = {
      'Content-Type': 'audio/mpeg',
      // 'Content-Type': 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      // isBase64Encoded: true,
    };

    try {
      if (event.httpMethod !== 'GET') {
        throw new Error(`Unsupported method "${event.httpMethod}"`);
      }
      const conference = 'october-2021-general-conference';
      const fileName = '2021-10-1010-russell-m-nelson-32k-eng.mp3';
      const directory = makeDirectory('tmp');
      const destination = `${directory}/${fileName}`;
      const data = await downloadFile(conference, fileName, destination);
      body = await fsPromises.readFile(destination, { encoding: 'utf-8' });
    } catch (err) {
      statusCode = '400';
      headers = {
        'Content-Type': 'application/json',
      };
      body = err.message;
    }
    body = process.env;

    return {
      statusCode: statusCode,
      body: body,
      headers: headers,
    };
  }
}

function getRandomConferenceSlug() {
  const months = ['april', 'october'];
  const randomMonthInt = Math.random() < 0.5 ? 0 : 1;
  return months[randomMonthInt];
}

function makeDirectory (dir) {
  if (process.env.environment === 'production') {
    return dir;
  }

  const localDir = resolve(dir);
  if (!existsSync(localDir)) {
    mkdirSync(localDir);
  }
  return localDir;
}

async function downloadFile (conference, fileName, destination) {
  const url = `https://media2.ldscdn.org/assets/general-conference/${conference}/${fileName}`;
  
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });
  response.data.pipe(createWriteStream(destination));
  
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve();
    });
    response.data.on('error', () => {
      reject();
    });
  });
}
