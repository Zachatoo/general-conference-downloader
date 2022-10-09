import axios from "axios";
import { randomInt } from "./number-utils";

export async function getToc() {
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

export function getRandomConferenceTocUrl() {
  const randomMonth = Math.random() < 0.5 ? "04" : "10"; // april or october
  const randomYear = randomInt(1971, new Date().getFullYear());
  const uri = encodeURI(`/general-conference/${randomYear}/${randomMonth}`);

  const url = getFullUrl(uri);
  return url;
}

export async function getAudioUrlFromTalkUri(talkUri: string) {
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

export function getFullUrl(uri: string) {
  const churchOfJesusChristBaseUrl =
    "https://www.churchofjesuschrist.org/study/api/v3/language-pages/type";
  const lang = "eng";
  return `${churchOfJesusChristBaseUrl}/content?lang=${lang}&uri=${uri}`;
}
