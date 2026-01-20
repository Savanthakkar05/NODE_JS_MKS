const express = require("express");
const {
  register,
  login,
  getProfile,
  logout,
} = require("../controller/user.controller");
const authenticationToken = require("../middleware/auth");
const route = express.Router();

route.post("/signup", register);
route.post("/signin", login);
route.get("/", authenticationToken, getProfile);
route.post("/logout", logout);
module.exports = route;
