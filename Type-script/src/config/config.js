require("ts-node/register");
const dotenv = require("dotenv");
dotenv.config();
module.exports = require("./database.config.ts").default;
