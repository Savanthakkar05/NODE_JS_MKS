const express = require("express");
const {
  deleteUserById,
  getUserById,
  getUsers,
  register,
  getProfile,
} = require("../controller/user.controller");
const route = express.Router();

route.post("/signup", register);
route.get("/", getUsers);
route.get("/:id", getUserById);
route.delete("/:id", deleteUserById);
route.get("/getProfile", getProfile);

module.exports = route;
