import { startServer } from "./server";
import { connect } from "./database";

async function main() {
  await connect();
  await startServer();
}

main().catch(console.error);
