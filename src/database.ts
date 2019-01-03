import mongo from "mongodb";

const secrets = require("../secrets.json");

const p = mongo.MongoClient.connect(secrets.mongo);
p.then(() => {
  console.log("Connected to database");
}, err => {
  console.error(err);
  process.exit(-1);
});

export async function withDb(cb: (db: mongo.MongoClient) => void | Promise<void>) {
  await cb(await p);
}