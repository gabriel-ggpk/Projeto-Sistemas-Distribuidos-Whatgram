const express = require("express");
const http = require("http");
const axios = require("axios"); // You will use axios to make HTTP requests

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.post("/notify", (req, res) => {
  // Assume the request to the notify endpoint now contains userId and message
  const { userId, message } = req.body;

  // Here you would make an API call to the notification module instead of using WebSocket
  // For example, let's say your notification module has an API endpoint at http://notification-module/notify
  axios
    .post(" http://localhost:4000/notify", {
      userId,
      message,
    })
    .then((response) => {
      // Handle success
      console.log("Notification sent:", response.data);
      res.status(200).send("Notification sent.");
    })
    .catch((error) => {
      // Handle error
      console.error("Error sending notification:", error);
      res.status(500).send("Failed to send notification.");
    });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
