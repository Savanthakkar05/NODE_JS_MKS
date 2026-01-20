const { body, param } = require("express-validator");

const registerSchema = [
  body("firstname").notEmpty().withMessage("Firstname is required"),
  body("lastname").notEmpty().withMessage("Lastname is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email Formate is wrong"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 character long")
    .notEmpty()
    .withMessage("Password is required"),
  body("role")
    .isIn(["admin", "user", "guide"])
    .withMessage("Invalid Role type. Allowed: admin,user,guide")
    .optional(),
];

const loginSchema = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email formate is wrong"),

  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordSchema = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email formate is wrong"),
];

const resetPasswordSchema = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 character long")
    .notEmpty()
    .withMessage("Password is required"),
  body("confirm_password")
    .notEmpty()
    .withMessage("Confirm Password is required"),
  param("token").notEmpty().withMessage("Token is required"),
];
module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
};
