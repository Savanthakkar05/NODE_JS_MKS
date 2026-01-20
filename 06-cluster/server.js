const express = require("express");
const os = require("os");
const cluster = require("cluster");

// console.log(cluster);
if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  app.get("/", (req, res) => {
    return res.json({ message: `Hello from server ${process.pid}` });
  });
  app.get("/home", (req, res) => {
    return res.json({ message: `Hello from client ${process.pid}` });
  });
  app.listen(3029, () => {
    console.log(`Server is run on ${process.pid}`);
  });

  //   console.log(`${process.pid}`);
}
