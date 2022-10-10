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
    const regex = new RegExp(
      `^https:\/\/media2\.ldscdn\.org\/assets\/general-conference\/(april|october)-\\d{4}-general-conference\/.*\.mp3$`
    );
    const { statusCode, body, headers } = await handler(
      createMockEvent("GET"),
      createMockContext()
    );
    const parsedBody = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(headers?.["Content-Type"]).toBe("application/json");
    expect(parsedBody).toHaveProperty("audioUrl");
    expect(parsedBody?.audioUrl).toBeTypeOf("string");
    expect(parsedBody?.audioUrl).toMatch(regex);
  });

  it("returns 501 if not POST", async () => {
    const { statusCode, body, headers } = await handler(
      createMockEvent("POST"),
      createMockContext()
    );

    expect(statusCode).toBe(501);
    expect(headers?.["Content-Type"]).toBe("text/plain");
    expect(body).toBe('Unsupported method "POST"');
  });

  it.each([
    [{ mockMonth: "october", mockYear: "2022" }],
    [{ mockMonth: "april", mockYear: "2000" }],
  ])(
    "returns talk from specific conference",
    async ({ mockYear, mockMonth }) => {
      const regex = new RegExp(
        `^https:\/\/media2\.ldscdn\.org\/assets\/general-conference\/${mockMonth}-${mockYear}-general-conference\/${mockYear}.*\.mp3$`
      );
      const queryStringParameters = {
        year: mockYear,
        month: mockMonth,
      };
      const { statusCode, body, headers } = await handler(
        createMockEvent("GET", { queryStringParameters }),
        createMockContext()
      );
      const parsedBody = JSON.parse(body);

      expect(statusCode).toBe(200);
      expect(headers?.["Content-Type"]).toBe("application/json");
      expect(parsedBody).toHaveProperty("audioUrl");
      expect(parsedBody?.audioUrl).toBeTypeOf("string");
      expect(parsedBody?.audioUrl).toMatch(regex);
    }
  );
});

function createMockEvent(
  httpMethod: string,
  options?: Partial<APIGatewayEvent>
): APIGatewayEvent {
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
    ...(options ?? {}),
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
