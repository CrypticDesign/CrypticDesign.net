export function createGoogleTagQueue(dataLayer: unknown[]): (...args: unknown[]) => void {
  return function queueGoogleTagCommand() {
    // Google gtag.js requires each queued command to retain the function Arguments object.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
}
