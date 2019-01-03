import mongoose from "mongoose";
import secrets from "../secrets.json";

export async function connect() {
  await mongoose.connect(secrets.mongo);
  console.log("Connected to mongodb");
}
