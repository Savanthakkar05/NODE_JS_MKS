const express = require("express");
const route = express.Router();
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  addCartSchema,
  removeCartSchema,
  getCartSchema,
} = require("../schema/cartSchema");
const {
  addToCart,
  getCart,
  removeCart,
} = require("../controller/cart.controller");

route.post("/add", auth, validate(addCartSchema), addToCart);
route.get("/:userId", auth, validate(getCartSchema), getCart);
route.delete("/remove", auth, validate(removeCartSchema), removeCart);

module.exports = route;
