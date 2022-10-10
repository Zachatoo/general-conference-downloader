import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getAudioUrlFromTalkUri, getToc } from "./src/church-utils";
import { UnsupportedMethodError } from "./src/errors";
import { getMonth } from "./src/query-string-parsers";
import { randomInt } from "./src/random";

export const handler = async (
  event: APIGatewayEvent,
  _: Context
): Promise<APIGatewayProxyResult> => {
  let body;
  let statusCode = 200;
  let headers = {
    "Content-Type": "application/json",
    isBase64Encoded: false,
  };

  try {
    if (event.httpMethod !== "GET") {
      throw new UnsupportedMethodError(event.httpMethod);
    }

    const toc = await getToc({
      year: event.queryStringParameters?.year,
      month: getMonth(event.queryStringParameters),
    });
    const randomTalkUri = toc[randomInt(0, toc.length - 1)];
    const audioUrl = await getAudioUrlFromTalkUri(randomTalkUri);
    body = { audioUrl };
  } catch (err) {
    if (err instanceof UnsupportedMethodError) {
      statusCode = 501;
    } else {
      statusCode = 500;
    }
    body = err instanceof Error ? err.message : err;
  } finally {
    if (typeof body !== "string") {
      body = JSON.stringify(body);
    } else {
      headers["Content-Type"] = "text/plain";
    }
  }

  return {
    statusCode,
    body,
    headers,
  };
};
