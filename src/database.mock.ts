import MongoMemoryServer from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;
export async function getMockMongoUri() {
  if (!mongoServer) {
    mongoServer = new MongoMemoryServer();
  }
  return await mongoServer.getConnectionString();
}

export async function closeMockMongoDb() {
  if (mongoServer) {
    console.log("Stopping Mock mongodb");
    await mongoServer.stop();
    mongoServer = null;
  }
}
