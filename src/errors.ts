export class UnsupportedMethodError extends Error {
  constructor(httpMethod: string) {
    super(`Unsupported method "${httpMethod}"`);
  }
}
