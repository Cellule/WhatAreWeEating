import { startServer } from "./server";
import { connect } from "./database";
import { getAzureMongodbUri } from "./database.azure";

async function main() {
  await connect(getAzureMongodbUri);
  await startServer();
}

main().catch(console.error);
