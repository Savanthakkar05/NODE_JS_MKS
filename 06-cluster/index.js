const cluster = require("cluster");
const http = require("http");
const os = require("os");

const numCpu = os.cpus().length;
// console.log(os.cpus());
if (cluster.isPrimary) {
  console.log(cluster.isPrimary);
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCpu; i++) {
    const worker = cluster.fork();
    // console.log(worker.process.pid);
  }
  // console.log(cluster.workers); // return object of the all workers

  cluster.on("exit", (worker, code, signal) => {
    // console.log("==> Worker", worker);
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });
} else {
  http
    .createServer((req, res) => {
      if (req.url === "/kill") {
        res.writeHead(200);
        res.end(`Worker ${process.pid} is committing suicide...`);
        console.log(`Worker ${process.pid} is existing...`);
        process.exit(1);
      }
      res.writeHead(200);
      res.end("Hello World! handled by worker : " + process.pid + "\n");
    })
    .listen(8000);
  console.log(`Worker ${process.pid} started`);
}
