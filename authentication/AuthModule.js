const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("request");
const app = express();

const PORT = 3000;
const SECRET_KEY = "your_secret_key";
const TARGET_SERVICE_URL = "http://localhost:3001"; // Target module/service URL

// Middleware to validate JWT
const validateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
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

// Intercept and forward the request
app.use(validateJWT, (req, res) => {
  const url = TARGET_SERVICE_URL + req.url;

  // Extract userId from the token and set it in the header
  const userId = req.user.userId; // Assuming the token has a userId field

  const options = {
    method: req.method,
    url: url,
    json: true,
    body: req.body,
    // Include the userId in the forwarded request's headers
    headers: {
      "Content-Type": "application/json",
      userId: userId, // Custom header with userId
    },
  };

  // Forwarding the request
  request(options, (error, response, body) => {
    if (error) {
      console.error("Error forwarding request:", error);
      return res.status(500).send({ error: "Error forwarding request" });
    }
    res.status(response.statusCode).send(body);
  });
});

app.listen(PORT, () => {
  console.log(`Authorization module listening on port ${PORT}`);
});
