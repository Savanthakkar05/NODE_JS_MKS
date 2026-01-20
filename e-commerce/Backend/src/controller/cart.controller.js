const asyncHandler = require("../utlils/asyncHandler");
const db = require("../models");
const ApiError = require("../utlils/ApiError");
const { StatusCodes } = require("http-status-codes");

exports.addToCart = asyncHandler(async (req, res) => {
  const { userId, quantity, productId } = req.body;

  let [cart] = await db.Cart.findOrCreate({
    where: { userId: userId },
  });

  let cartItem = await db.CartItem.findOne({
    where: {
      cartId: cart.id,
      productId: productId,
    },
  });

  if (cartItem) {
    cartItem.quantity += parseInt(quantity);
    await cartItem.save();
  } else {
    const product = await db.Product.findOne({
      where: { id: productId },
    });

    if (!product)
      throw new ApiError("Product Not Found.", StatusCodes.NOT_FOUND);

    cartItem = await db.CartItem.create({
      cartId: cart.id,
      productId: productId,
      quantity: quantity,
      priceAtAdd: product.price,
    });
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Item added to cart", cartItem });
});

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await db.Cart.findOne({
    where: {
      userId: req.params.userId,
    },
    include: [
      {
        model: db.CartItem,
        as: "cartItem",
        include: {
          model: db.Product,
          as: "product",
        },
      },
    ],
  });

  if (!cart) throw new ApiError("Cart is empty", StatusCodes.BAD_REQUEST);

  return res.status(StatusCodes.OK).json({ success: true, cart });
});

exports.removeCart = asyncHandler(async (req, res) => {
  const cart = await db.Cart.findOne({
    where: {
      userId: req.body.userId,
    },
  });

  if (!cart) throw new ApiError("Cart not found", StatusCodes.NOT_FOUND);

  const rowsDeleted = await db.CartItem.destroy({
    where: {
      cartId: cart.id,
      productId: req.body.productId,
    },
  });

  if (rowsDeleted === 0) {
    return res.status("Item not found in this cart", StatusCodes.BAD_REQUEST);
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Item removed from cart" });
});
