const jwt = require('jsonwebtoken');

const SECRET_KEY = "your_super_secret_key"; // Must match server.js exactly

const payload = {
  username: "TestUser",
  id: 123
};

const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

console.log("⬇️ COPY THIS TOKEN BELOW ⬇️");
console.log(token);