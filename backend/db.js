const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://gabriel:BlackBerry10@projetosd.unqwnwj.mongodb.net/?retryWrites=true&w=majority&appName=ProjetoSD";
const dbName = "whatsgram";
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
