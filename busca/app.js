const express = require("express");
const { connect, getDb } = require("./database");

const app = express();
app.use(express.json());

// Connect to MongoDB
connect().catch((err) => console.error("Connection error", err));

// GET route to fetch all clients
app.get("/clients", async (req, res) => {
  try {
    const db = getDb();
    const clients = await db.collection("clients").find({}).toArray();
    res.json(clients);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/clients", async (req, res) => {
  try {
    const db = getDb();
    const { name, email } = req.body; // Extract name and email from request body
    if (!name || !email) {
      return res.status(400).send("Name and email are required");
    }
    const result = await db.collection("clients").insertOne({ name, email });
    res.status(201).json(result.ops[0]); // Send back the created client document
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
