const express = require("express");
const {
  createUser,
  getOrderwithUser,
} = require("../controller/user.controller");
const route = express.Router();

route.post("/add", createUser);
route.get("/", getOrderwithUser);
module.exports = route;
