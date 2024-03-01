const express = require("express");
const { connect, getDb } = require("./db");
const axios = require("axios");

const cors = require("cors");
const bcrypt = require("bcrypt");
const SECRET_KEY = "teste";
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
(async function startServer() {
  try {
    const app = express();
    app.use(express.json());
    app.use(cors());
    // Connect to MongoDB
    await connect().catch((err) => console.error("Connection error", err));
    const db = getDb();
    // Middleware to validate JWT
    const validateJWT = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader === undefined) {
        return res.status(401).send({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: "Invalid token" });
        }
        req.user = decoded; // Keep user data in the request
        next();
      });
    };

    // check if the password is valid comparing with the db hashed password then return a jwt token with the userId inside
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const client = await db.collection("clients").findOne({ email });
        if (!client) {
          return res.status(401).send("Usuário não encontrado");
        }
        //check if the password is valid with the hashd db password
        const isPasswordValid = await bcrypt.compare(password, client.password);
        if (!isPasswordValid) {
          return res.status(401).send("Senha inválida");
        }
        const token = jwt.sign({ userId: client._id }, SECRET_KEY);
        res.json({ token, userId: client._id });
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
    //POST route clients (verifica e insere ao banco)

    app.post("/register", async (req, res) => {
      try {
        const { username, email, password } = req.body; // Extract username, email and password from request body
        if (!username || !email || !password) {
          return res
            .status(400)
            .send("Username, email and password are required");
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db
          .collection("clients")
          .insertOne({ username, email, password: hashedPassword });
        console.log(result);
        res.status(201).json(result); // Send back the created client document
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    app.use(validateJWT);
    // GET route to fetch all clients (carrega todos os clientes)
    app.get("/clients", async (req, res) => {
      try {
        const clients = await db.collection("clients").find({}).toArray();
        res.json(clients);
      } catch (error) {
        res.status(500).send(error);
      }
    });

    //GET route para filtrar os clientes pelo id

    app.get("/client", async (req, res) => {
      try {
        const { userId } = req.headers.userId;

        const client = await db.collection("clients").findOne({ userId });
        if (!client) {
          return res.status(404).send("Cliente não encontrado");
        }
        res.json(client);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    //GET route para filtrar chats pelo cliente

    app.get("/chats", async (req, res) => {
      try {
        const { userId } = req.user;
        const chats = await db
          .collection("chats")
          .find({ $or: [{ client1: userId }, { client2: userId }] })
          .toArray();
        if (!chats) {
          res.json([]);
        }
        res.json(chats);
      } catch (error) {
        res.status(500).send(error);
      }
    });

    //POST route para inserir no banco

    app.post("/chats", async (req, res) => {
      try {
        const { destinationId, content } = req.body;
        const { userId } = req.user;
        // Ensure client IDs are in ObjectId format for MongoDB
        const user1Id = new ObjectId(destinationId);
        const user2Id = new ObjectId(userId);

        // Find a chat where both users are present
        const chat = await db.collection("chats").findOne({
          users: { $all: [user1Id, user2Id] },
        });

        if (chat) {
          // If the chat exists, push the new message to the messages array
          const result = await db.collection("chats").updateOne(
            { _id: chat._id },
            { $push: { messages: { content, sentAt: new Date() } } } // Assuming you want to store the timestamp of when the message was sent
          );
        } else {
          // If not, create a new chat document with both users and the initial message
          const result = await db.collection("chats").insertOne({
            users: [user1Id, user2Id],
            messages: [{ content, sentAt: new Date() }], // Same assumption about timestamp
          });
        }
        const notificationData = {
          destinationId: destinationId, // The ID of the user to notify
          content: content,
          originId: userId, // The ID of the user who sent the message
        };

        // Send notification
        axios
          .post("http://localhost:4000/notify", notificationData)
          .then((response) => {
            res.status(200).json("Notification sent successfully");
            console.log("Notification sent successfully");
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          });
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    //GET route para retornar chat com os clientes presentes

    app.get("/chats/:client1", async (req, res) => {
      try {
        const { client1 } = req.params;
        const { client2 } = req.params;

        const chat = await db
          .collections("chats")
          .findOne({ client1 }, { client2 });
        if (!chat) {
          res.status(404).send("Chat não encontrado");
        }
        res.json(chat);
      } catch (error) {
        res.status(500).send(error);
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process with an error code
  }
})();
