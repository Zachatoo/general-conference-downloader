import {
  APIGatewayEvent,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventIdentity,
  APIGatewayEventRequestContextWithAuthorizer,
  Context,
} from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handler } from "../index";

describe("handler", () => {
  it("returns valid response on GET", async () => {
    const { statusCode, body, headers } = await handler(
      createMockEvent("GET"),
      createMockContext()
    );
    const parsedBody = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(headers?.["Content-Type"]).toBe("application/json");
    expect(parsedBody).toHaveProperty("audioUrl");
    expect(parsedBody?.audioUrl).toBeTypeOf("string");
  });

  it("returns 501 if not GET", async () => {
    const { statusCode, body, headers } = await handler(
      createMockEvent("POST"),
      createMockContext()
    );

    expect(statusCode).toBe(501);
    expect(headers?.["Content-Type"]).toBe("text/plain");
    expect(body).toBe('Unsupported method "POST"');
  });
});

function createMockEvent(httpMethod: string): APIGatewayEvent {
  const mockIdentity: APIGatewayEventIdentity = {
    accessKey: null,
    accountId: null,
    apiKey: null,
    apiKeyId: null,
    caller: null,
    clientCert: null,
    cognitoAuthenticationProvider: null,
    cognitoAuthenticationType: null,
    cognitoIdentityId: null,
    cognitoIdentityPoolId: null,
    principalOrgId: null,
    sourceIp: "",
    user: null,
    userAgent: null,
    userArn: null,
  };
  const mockRequestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> =
    {
      accountId: "",
      apiId: "",
      authorizer: undefined,
      protocol: "",
      httpMethod: "",
      identity: mockIdentity,
      path: "",
      stage: "",
      requestId: "",
      requestTimeEpoch: 0,
      resourceId: "",
      resourcePath: "",
    };
  const mockEvent: APIGatewayEvent = {
    httpMethod,
    body: null,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: "",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: mockRequestContext,
    resource: "",
  };
  return mockEvent;
}

function createMockContext(): Context {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: function (): number {
      throw new Error("Function not implemented.");
    },
    done: function (error?: Error | undefined, result?: any): void {
      throw new Error("Function not implemented.");
    },
    fail: function (error: string | Error): void {
      throw new Error("Function not implemented.");
    },
    succeed: function (messageOrObject: any): void {
      throw new Error("Function not implemented.");
    },
  };
  return mockContext;
}
