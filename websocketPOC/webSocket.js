const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.post("/notify", (req, res) => {
  const { message } = req.body;
  wss.clients.forEach((client) => {
    console.log(client);
    if (client.readyState === WebSocket.OPEN) {
      console.log("aaaaa");
      client.send(message);
    }
  });
  res.status(200).send("Notification sent.");
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Notification Module listening at http://localhost:${PORT}`);
});
