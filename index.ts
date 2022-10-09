import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getAudioUrlFromTalkUri, getToc } from "./src/church-utils";
import { UnsupportedMethodError } from "./src/errors";
import { randomInt } from "./src/number-utils";

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

    const toc = await getToc();
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
