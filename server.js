const port = Number.parseInt(process.env.PORT || process.env.APP_PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

async function start() {
  const http = await import("node:http");
  const nextModule = await import("next");
  const next = nextModule.default;
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  http
    .createServer((request, response) => handle(request, response))
    .listen(port, hostname, function () {
      this.keepAliveTimeout = 65000;
      this.headersTimeout = 66000;
      this.requestTimeout = 120000;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
