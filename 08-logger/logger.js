const asyncLocalStorage = require("./context");

const logger = {
  info: (message) => {
    const store = asyncLocalStorage.getStore();
    const requestId = store ? store.requestId : "SYSTEM";
    const userId = store && store.userId ? store.userId : "GUEST";

    console.log(`[Req : ${requestId}] [User : ${userId}] -> ${message}`);
  },
  error: (message) => {
    const store = asyncLocalStorage.getStore();
    const requestId = store ? store.requestId : "SYSTEM";
    console.error(`[Req : ${requestId}] ERROR -> ${message}`);
  },
};

module.exports = logger;
