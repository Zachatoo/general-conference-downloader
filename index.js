/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 */
exports.handler = async (event, context) => {
  const { App } = await import('./src/app.mjs');
  console.log('app', App);
  return new App(event, context);
  // return await App(event, context);
}
