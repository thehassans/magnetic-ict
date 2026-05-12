const http = require("node:http");
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const next = require("next");

const port = Number.parseInt(process.env.PORT || process.env.APP_PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";

const hasBuild = existsSync(join(__dirname, ".next", "BUILD_ID"));
const isProduction = process.env.NODE_ENV === "production";
const dev = !isProduction || !hasBuild;

if (isProduction && !hasBuild) {
  console.warn(
    "[server] WARNING: No production build found (.next/BUILD_ID missing).\n" +
    "[server] Starting in development mode — run `npm run build` for full performance.\n" +
    "[server] The app will compile pages on first request (expect slower initial loads)."
  );
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((request, response) => handle(request, response))
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port} [${dev ? "dev/on-demand" : "production"}]`);
      });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
