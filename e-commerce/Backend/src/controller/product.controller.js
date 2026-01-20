const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const ApiError = require("../utlils/ApiError");
const asyncHandler = require("../utlils/asyncHandler");
const axios = require("axios");
const client = require("../utlils/redis");

exports.createProduct = asyncHandler(async (req, res) => {
  const response = await axios.get(
    "https://dummyjson.com/products?limit=194&page=1"
  );
  const products = response.data.products;
  // console.log(products);
  const formattedProducts = products.map((item) => ({
    title: item.title,
    description: item.description,
    price: item.price,
    stock: item.stock,
    images: item.images[0],
    thumbnail: item.thumbnail,
  }));

  const createProducts = await db.Product.bulkCreate(formattedProducts);
  return res
    .status(StatusCodes.CREATED)
    .json({ success: true, message: "Product create", data: createProducts });
});

exports.getAllProduct = asyncHandler(async (req, res) => {
  const productData = await client.get("products");

  if (productData) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Products",
      data: JSON.parse(productData),
    });
  }

  const products = await db.Product.findAll();
  // console.log("===> ", products);

  await client.set("products", JSON.stringify(products));
  await client.expire("products", 3600);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Products",
    data: products,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await db.Product.findOne({ where: { id: req.params.id } });
  console.log(">>", product);
  if (!product) {
    throw new ApiError("Product not found!!", StatusCodes.NOT_FOUND);
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Product Found...", data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await db.Product.findOne({ where: { id: req.params.id } });

  if (!product) {
    throw new ApiError("Product not found!!", StatusCodes.NOT_FOUND);
  }

  const updatedProduct = await db.Product.update(req.body, {
    where: { id: req.params.id },
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Product has been updated",
    product: updatedProduct,
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await db.Product.findOne({ where: { id: req.params.id } });

  if (!product) {
    throw new ApiError("Product not found!!", StatusCodes.NOT_FOUND);
  }

  await db.Product.destroy({ where: { id: req.params.id } });

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Delete product" });
});
