import axios from "axios";

export class App {
  constructor(event, context) {
    return this.init(event, context);
  }

  async init(event, context) {
    let body;
    let statusCode = "200";
    let headers = {
      "Content-Type": "application/json",
      isBase64Encoded: false,
    };

    try {
      if (event.httpMethod !== "GET") {
        throw new Error(`Unsupported method "${event.httpMethod}"`);
      }

      const toc = await getToc();
      const randomTalkUri = toc[randomInt(0, toc.length - 1)];
      const audioUrl = await getAudioUrlFromTalkUri(randomTalkUri);
      body = { audioUrl };
    } catch (err) {
      statusCode = "500";
      body = err.message;
    } finally {
      if (typeof body !== "string") {
        body = JSON.stringify(body);
      }
    }

    return {
      statusCode,
      body,
      headers,
    };
  }
}

async function getToc() {
  const url = getRandomConferenceTocUrl();
  const response = await axios({
    method: "GET",
    url,
  });

  const { body } = response.data?.content;
  if (!body) {
    throw new Error(`Failed to parse table of contents at ${url}`);
  }

  const regex = /\/general-conference\/\d{4}\/\d{2}\/.+?"/g;
  const matches = [...body.matchAll(regex)]
    .map((match) => match[0].substring(0, match[0].length - 1))
    .filter((match) => match.indexOf("session") === -1);

  if (matches?.length === 0) {
    throw new Error(
      `Failed to find matches in table of contents with the following regex ${regex}`
    );
  }
  return matches;
}

function getRandomConferenceTocUrl() {
  const randomMonth = Math.random() < 0.5 ? "04" : "10"; // april or october
  const randomYear = randomInt(1971, new Date().getFullYear());
  const uri = encodeURI(`/general-conference/${randomYear}/${randomMonth}`);

  const url = getFullUrl(uri);
  return url;
}

async function getAudioUrlFromTalkUri(talkUri) {
  const url = getFullUrl(talkUri);
  const response = await axios({
    method: "GET",
    url,
  });

  const { mediaUrl } = response.data?.meta?.audio?.[0];
  if (!mediaUrl) {
    throw new Error(`Failed to download audio for conference talk at ${url}`);
  }
  return mediaUrl;
}

function getFullUrl(uri) {
  const churchOfJesusChristBaseUrl =
    "https://www.churchofjesuschrist.org/study/api/v3/language-pages/type";
  const lang = "eng";
  return `${churchOfJesusChristBaseUrl}/content?lang=${lang}&uri=${uri}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
