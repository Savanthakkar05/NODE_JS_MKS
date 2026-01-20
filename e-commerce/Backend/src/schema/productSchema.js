const { body, param } = require("express-validator");

exports.createProductSchema = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").optional(),
  body("price").notEmpty().withMessage("Price is required"),
  body("stock").optional(),
  body("images").notEmpty().withMessage("Images is required"),
  body("thumbnail").notEmpty().withMessage("Thumbnail is required"),
];

exports.getProductSchema = [
  param("id").notEmpty().withMessage("Product id is required"),
];

exports.updateProductSchema = [
  param("id").notEmpty().withMessage("Product id is required"),
];

exports.deleteProductSchema = [
  param("id").notEmpty().withMessage("Product id is required"),
];
