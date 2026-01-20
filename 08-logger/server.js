const express = require("express");
const asyncLocalStorage = require("./context");
const logger = require("./logger");
const crypto = require("crypto");
const app = express();

app.use((req, res, next) => {
  const requestId = crypto.randomInt(100,999);
  const userId = `Guest_${crypto.randomInt(10000,99999)}`;

  asyncLocalStorage.run({ requestId, userId }, () => {
    logger.info(`Incoming ${req.method} ${req.url}`);
    next();
  });
});

async function processPayment() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  logger.info("Processing payment in DB....");
  return "Success";
}

app.get("/buy", async (req, res) => {
  try {
    logger.info("Controller Started");
    await processPayment();
    logger.info("Controller Finished");
    res.json({ status: 200 });
  } catch (error) {
    logger.error(`Error ${error.message}`);
  }
});
app.listen(5001, () => {
  console.log(`Server is run on 5001`);
});
