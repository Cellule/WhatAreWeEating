import express from "express";
import bodyParser from "body-parser";
import mongo from "mongodb";

const secrets = require("../secrets.json");

let db: mongo.MongoClient;
mongo.MongoClient.connect(secrets.mongo, (err, _db) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  }
  console.log("Connected to database");
  db = _db;
});

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});
app.post("/api/world", (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));