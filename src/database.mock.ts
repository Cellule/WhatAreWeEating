import MongoMemoryServer from 'mongodb-memory-server';

export let mongoServer: MongoMemoryServer | null = null;
export async function getMockMongoUri() {
  if (!mongoServer) {
    mongoServer = new MongoMemoryServer();
  }
  const connectionString = await mongoServer.getConnectionString();
  console.log(`Started Mock mongodb at ${connectionString}`);
  return connectionString;
}

export async function closeMockMongoDb() {
  if (mongoServer) {
    console.log("Stopping Mock mongodb");
    await mongoServer.stop();
    mongoServer = null;
  }
}
