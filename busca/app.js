const express = require("express");
const { connect, getDb } = require("./database");

const app = express();
app.use(express.json());

// Connect to MongoDB
connect().catch((err) => console.error("Connection error", err));

// GET route to fetch all clients (carrega todos os clientes)
app.get("/clients", async (req, res) => {
  try {
    const db = getDb();
    const clients = await db.collection("clients").find({}).toArray();
    res.json(clients);
  } catch (error) {
    res.status(500).send(error);
  }
});

//POST route clients (verifica e insere ao banco)

app.post("/clients", async (req, res) => {
  try {
    const db = getDb();
    const { username, email, password} = req.body; // Extract username, email and password from request body
    if (!username || !email || !password) {
      return res.status(400).send("Username, email and password are required");
    }
    const result = await db.collection("clients").insertOne({ username, email, password });
    res.status(201).json(result.ops[0]); // Send back the created client document
  } catch (error) {
    res.status(500).send(error);
  }
});

//GET route para filtrar os clientes pelo id

app.get("/clients", async (req, res) => {
  try{
    const { userId } = req.headers.userId;
    const db = getDb();
    const client = await db.collection("clients").findOne({ userId });
    if(!client){
      return res.status(404).send("Cliente não encontrado")
    }
    res.json(client);
  }catch (error){res.status(500).send(error);}
});

//GET route para filtrar chats pelo cliente

app.get("/chats/:userId", async(req, res) => {
  try{
    const { userId } = req.headers.userId;
    const db = getDb();
    const chats = await db.collection("chats").find({ $or: [{ client1: userId }, { client2: userId }] }).toArray();
    if(!chats){
      res.status(404).send("Esse usuário não está presente em chats!")
    }
    res.json(chats);
  }catch(error){res.status(500).send(error);}
});

//GET route para carregar todos os chats

app.get("/chats", async (req, res) => {
  try{
    const db = getDb();
    const chats = await db.collection("chats").find({}).toArray();
    res.json(chats);
  }catch (error){res.status(500).send(error);}
});

//POST route para inserir no banco

app.post("/chats", async(req, res) =>{
  try{
    const db = getDb();
    const {client1, client2, messages} = req.body;

    //Espaço para possível if

    const result = await db.collection("chats").insertOne({client1, client2, messages});
    res.status(201).json(result.ops[0]);
  }catch(error){res.status(500).send(error);}
});

//GET route para retornar chat com os clientes presentes

app.get("/chats/:client1/:client2", async(req, res) => {
  try{
    const { client1 } = req.params;
    const { client2 } = req.params;
    const db = getDb();
    const chat = await db.collections("chats").findOne({ client1 }, { client2 });
    if(!chat){
      res.status(404).send("Chat não encontrado");
    }
    res.json(chat);
  }catch (error){res.status(500).send(error);}
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
