const http = require("node:http");
const { AsyncLocalStorage } = require("node:async_hooks");
 
// 1. Create a global instance of the storage
const asyncLocalStorage = new AsyncLocalStorage();
 
// A utility function to simulate logging deep in the application
function logWithRequestId(message) {
  // 3. Retrieve the context from the "backpack" anywhere in the code
  const store = asyncLocalStorage.getStore();
  const reqId = store ? store.requestId : "UNKNOWN";
 
  console.log(`[Request-ID: ${reqId}] ${message}`);
}
 
// A service function (notice it takes NO arguments regarding Request ID)
function doDatabaseWork() {
  setTimeout(() => {
    logWithRequestId("Database query finished successfully.");
  }, 3000);
}
 
const server = http.createServer((req, res) => {
  //   console.log(req.url);
 
  if (req.url === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }
  const requestId = Math.floor(Math.random() * 1000);
 
  // 2. Initialize the context context using .run()
  // Everything inside this callback has access to the store
  asyncLocalStorage.run({ requestId }, () => {
    logWithRequestId("Request received");
    doDatabaseWork(); // We call this without passing ID!
    res.end("Hello World");
  });
});
 
server.listen(3000, () => console.log("Server running..."));