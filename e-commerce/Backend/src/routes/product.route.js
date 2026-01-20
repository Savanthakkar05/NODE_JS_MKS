const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/product.controller");
const validate = require("../middleware/validate");
const {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
} = require("../schema/productSchema");
const route = express.Router();

route.post("/add", auth, createProduct);
route.get("/", getAllProduct);
route.post("/:id", auth, validate(getProductSchema), getProductById);
route.patch("/:id", auth, validate(updateProductSchema), updateProduct);
route.delete("/:id", auth, validate(deleteProductSchema), deleteProduct);

module.exports = route;
