import mongoose from "mongoose";

export async function connect(getMongodbUri: () => Promise<string>) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(await getMongodbUri(), {
      useNewUrlParser: true,
    });
    console.log("Connected to mongodb");
  }
}

export async function disconnect() {
  console.log("Disconnecting database");
  await mongoose.disconnect();
}
