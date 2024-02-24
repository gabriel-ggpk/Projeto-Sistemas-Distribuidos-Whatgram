const express = require("express");
const axios = require("axios"); // For making HTTP requests to the notification module
const app = express();
const PORT = 3000;

app.use(express.json());
// API endpoint que recebe a mensagem da notificação no body e manda para o websocket via API POST call
app.post("/send-message", async (req, res) => {
  const { message } = req.body;
  try {
    await axios.post("http://localhost:4000/notify", { message });
    res.status(200).send("Message sent to notification module.");
  } catch (error) {
    console.error("Error sending message to notification module:", error);
    res.status(500).send("Failed to send message to notification module.");
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
