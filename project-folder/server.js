require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const httpServer = require("http").Server(app);
const bodyParser = require("body-parser");
const db = require("./app/db/models");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const { common } = require("./utils");
const { responseOverwrite } = require("./app/db/audit-logger/utils");
var morgan = require("morgan");
const { initAuditLogger } = require("./app/db/audit-logger/mongoose_audit_log");

//* App Route Versions
const V1Routes = "/api/v1";

app.set("trust proxy", true);

//* Overwrite the default res.json method to enable API response tracking.
app.use(responseOverwrite);

// ** Response Compression
app.use(compression());

//* Morgan
const accessLogs = fs.createWriteStream("./access.log", { flags: "a" });
app.use(
  morgan(":remote-addr [:date[web]] :method :url :status - :response-time ms", {
    stream: accessLogs,
  })
);

// ** Body Parser Options
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

// ** Checks if folders exist else create folders for static files
let folders = ["uploads", "json-config", "uploads/user-profile"];
folders.forEach((f) => {
  if (!fs.existsSync(f)) {
    fs.mkdirSync(f);
  }
});

// ** Statis Files route
app.use("/uploads", express.static("uploads"));

//* Schedulers & CRON Jobs
if (process.env.ENABLE_SCHEDULAR == String(true)) {
  require("./cron");

  //? To use scheduler MONGODB_URL & MONGO_DB env variables must be set.
  if (process.env.MONGODB_URL && process.env.MONGO_DB) require("./scheduler");
}

// ** Sequelize Connection and Sync
db.sequelize
  .authenticate()
  .then(() => {
    /* eslint-disable no-console */
    console.log("DB connected!");
    // db.sequelize
    //   .sync({ force: false, alter: true })
    //   .then(() => {
    //     console.log("DB Synced!");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     console.log("DB Synced Failed!: ", err.message);
    //   });
  })
  .catch((err) => {
    /* eslint-disable no-console */
    console.error("DB connection failed!", err.message);
  });

// ** CORS Options
app.use(
  cors({
    origin: "*",
  })
);

// Function to check if a function is asynchronous
function isFunctionAsync(fn) {
  return fn.constructor.name === "AsyncFunction";
}

// App Routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    res.status(500).json({ error: `${err}` });
    common.throwException(err);
  });
};

const wrapRoutesWithAsyncHandler = (router) => {
  router.stack.forEach((layer) => {
    if (layer.handle && layer.handle.stack) {
      // Iterate over the nested layers
      layer.handle.stack.forEach((innerLayer) => {
        if (innerLayer.handle && innerLayer.handle.stack) {
          innerLayer.handle.stack.forEach((subInnerLayer) => {
            subInnerLayer.route.stack.forEach((deepLayer) => {
              if (isFunctionAsync(deepLayer.handle)) {
                // Pass only async functions to async handler
                deepLayer.handle = asyncHandler(deepLayer.handle);
              }
            });
          });
        }
      });
    }
  });
  return router;
};

app.use(
  V1Routes,
  wrapRoutesWithAsyncHandler(require("./app/routes_controller"))
);

app.get("/", (req, res) => {
  return res.json({ message: "Server running." });
});

// //* Server
app.use((req, res, next) => {
  req.APINotFound = true;
  return res.status(404).json({
    error: "Not Found",
    message: `EndPoint not available: ${req.method} ${req.originalUrl?.split("?")[0]}`,
  });
});

//* Server
httpServer.listen(process.env.PORT || 5000, function () {
  console.log("Magic happens on localhost:" + process.env.PORT);
});

//* MongoDB connection
if (process.env.MONGODB_URL && process.env.MONGO_DB) {
  mongoose
    .connect(process.env.MONGODB_URL, {
      dbName: process.env.MONGO_DB,
    })
    // eslint-disable-next-line no-console
    .then(() => {
      console.log("Mongo DB connected!");

      //* init mongoose related create audit-logs details
      initAuditLogger();
    })
    // eslint-disable-next-line no-console
    .catch((error) =>
      console.log(error.message, "Mongo connection failed", error)
    );
}

process.on("unhandledRejection", (error, p) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection :", error.message);
});

process.on("uncaughtException", (error, p) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception :", error.message);
});
