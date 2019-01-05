import { getMockMongoUri, closeMockMongoDb } from "./database.mock";
import { connect, disconnect } from "./database";
import { startServer, stopServer, ExpressApplication } from "./server";

export type ExpressApplication = ExpressApplication;
export async function setupServer() {
  await connect(getMockMongoUri);
  return await startServer();
}

export async function cleanup() {
  await stopServer();
  await disconnect();
  await closeMockMongoDb();
}
