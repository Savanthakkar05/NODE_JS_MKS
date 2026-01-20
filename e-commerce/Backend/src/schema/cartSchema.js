const { body, param } = require("express-validator");

const addCartSchema = [
  body("userId").notEmpty().withMessage("User id is required"),
  body("productId").notEmpty().withMessage("Product id is required"),
  body("quantity").default(1),
];

const getCartSchema = [
  param("userId").notEmpty().withMessage("User id is required"),
];

const removeCartSchema = [
  body("userId").notEmpty().withMessage("User id is required"),
  body("productId").notEmpty().withMessage("Product id is required"),
];

module.exports = { addCartSchema, getCartSchema, removeCartSchema };
