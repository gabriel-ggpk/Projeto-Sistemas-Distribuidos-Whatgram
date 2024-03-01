const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("request");
const app = express();

const PORT = 3000;
const SECRET_KEY = "your_secret_key";

function determineURLByServiceName(serviceName) {
  // Example mapping, replace with your actual logic
  const serviceMap = {
    client: "http://localhost:3001",
    group: "http://localhost:3002",
    // Add more mappings as necessary
  };
  return serviceMap[serviceName] || "http://localhost:9999";
}
function forwardRequest(options, res) {
  request(options, (error, response, body) => {
    if (error) {
      console.error("Error forwarding request:", error);
      return res.status(500).send({ error: "Error forwarding request" });
    }
    res.status(response.statusCode).send(body);
  });
}
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
  const serviceName = req.headers["x-target-service"]; // Custom header to specify the target
  const targetServiceURL = determineURLByServiceName(serviceName); // You need to implement this function

  const options = {
    method: req.method,
    url: targetServiceURL,
    json: true,
    body: req.body,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": req.user.userId,
    },
  };

  forwardRequest(options, res);
});

app.listen(PORT, () => {
  console.log(`Authorization module listening on port ${PORT}`);
});
