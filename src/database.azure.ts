import secrets from "../secrets.json";

export async function getAzureMongodbUri() {
  return secrets.mongo;
}