import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

// Use the library-provided `defaultStreamHandler` as the request callback.
// createStartHandler accepts either a handler function or an options object
// with a `handler` property. Passing the default stream handler ensures the
// internal lifecycle is wired correctly.
const handler = createStartHandler(defaultStreamHandler as any);

export default {
  async fetch(request: Request) {
    return handler(request);
  },
};
