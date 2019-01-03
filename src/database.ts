import mongoose from "mongoose";

const secrets = require("../secrets.json");

export async function connect() {
  await mongoose.connect(secrets.mongo);
  console.log("Connected to mongodb");
}
