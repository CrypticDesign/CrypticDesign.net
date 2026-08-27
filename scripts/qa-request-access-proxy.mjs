// Local QA only: observe HTTP methods/paths without recording headers, query strings,
// bodies, or personal data. This is not deployed or used by the application.
import http from "node:http";

http.createServer((request, response) => {
  console.log(JSON.stringify({ method: request.method, path: new URL(request.url, "http://127.0.0.1").pathname }));
  const upstream = http.request({
    hostname: "127.0.0.1", port: 3001, path: request.url, method: request.method,
    headers: { ...request.headers, host: "127.0.0.1:3001" },
  }, upstreamResponse => {
    response.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  upstream.on("error", () => { response.writeHead(502); response.end("QA upstream unavailable"); });
  request.pipe(upstream);
}).listen(3002, "127.0.0.1", () => console.log("CRY-504 QA observer listening on 3002"));
