import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

export function getMonth(
  queryStringParameters: APIGatewayProxyEventQueryStringParameters | null
): "04" | "10" | undefined {
  if (queryStringParameters?.month) {
    if (queryStringParameters.month === "april") {
      return "04";
    }
    if (queryStringParameters.month === "october") {
      return "10";
    }
  }
  return undefined;
}
