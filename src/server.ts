import express from "express";
import bodyParser from "body-parser";
import { attachApiRoutes } from "./api";
import { Server } from "http";

export type ExpressApplication = express.Express;
let app: ExpressApplication | null = null;
let server: Server | null = null;
export async function startServer() {
  if (!app) {
    app = express();
    const port = process.env.PORT || 5000;
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    attachApiRoutes(app);

    server = app.listen(port, () => console.log(`Listening on port ${port}`));
    const _server = server;
    await new Promise((resolve, reject) => {
      _server.on("listening", resolve);
      _server.on("error", reject);
    });
  }
  return app;
}

export async function stopServer() {
  if (server) {
    const _server = server;
    console.log("Stopping server");
    await new Promise(resolve => _server.close(resolve));
  }
  server = null;
  app = null;
}
