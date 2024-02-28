const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "myDatabase";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connect() {
  await client.connect();
  console.log("Connected successfully to MongoDB");
  db = client.db(dbName);
}

function getDb() {
  return db;
}

module.exports = { connect, getDb };
