const express = require("express");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../schema/userSchema");
const {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controller/user.controller");
const { auth } = require("../middleware/auth");

const route = express.Router();

route.post("/signup", validate(registerSchema), register);
route.post("/signin", validate(loginSchema), login);
route.get("/", auth, getProfile);
route.post("/logout", auth, logout);
route.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
route.patch(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

module.exports = route;
