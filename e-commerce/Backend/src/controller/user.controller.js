const asyncHandler = require("../utlils/asyncHandler");
const db = require("../models/index");
const ApiError = require("../utlils/ApiError");
const { StatusCodes } = require("http-status-codes");
const { generateToken } = require("../utlils/generateToken");
const { sendingMail } = require("../utlils/mail");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
dotenv.config();

exports.register = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const user = await db.User.findOne({ where: { email: req.body?.email } });
  if (user) {
    throw new ApiError("User already exist", StatusCodes.BAD_REQUEST);
  }

  // const hashedPass = await bcrypt.hash(password, 10);
  const newUser = await db.User.create({
    firstname,
    lastname,
    email,
    password: hashedPass,
  });

  const accessToken = await generateToken(newUser);

  // console.log("Token", accessToken);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // maxAge: 20 * 60 * 1000,
    secure: false,
  });

  // res.cookie("accessToken", accessToken);

  const subject = "You have registered successfully";
  const html = `<h1>Successfully registered.</h1>
  <p>Enjoy and make order on our website</p>`;

  await sendingMail(newUser.email, subject, html);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User Registered..",
    data: newUser,
    token: {
      accessToken,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await db.User.findOne({
    where: { email: req.body?.email },
    // attributes: {
    //   exclude: ["password"],
    // },
  });
  if (!user) throw new ApiError("User not found!!", StatusCodes.NOT_FOUND);

  if (!user.validPassword(req.body?.password)) {
    throw new ApiError("Password is Invalid");
  }

  const accessToken = generateToken(user);

  // console.log("Token", accessToken);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // maxAge: 20 * 60 * 1000,
    secure: false,
  });

  // res.cookie("accessToken", accessToken);

  const { password, ...userData } = user.toJSON();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User Logged In Successfully...",
    data: userData,
    token: {
      accessToken,
    },
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await db.User.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    throw new ApiError("User not found!!", StatusCodes.NOT_FOUND);
  }

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "User Profile", data: user });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    // sameSite: "strict",
    secure: false,
  });

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Logout Successfully.." });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await db.User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return res
      .status(StatusCodes.OK)
      .json({ success: false, message: "If email exist, link sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const subject = "Reset password";
  const html = `<h1>Reset Password</h1>
  <p>Reset your password : ${resetUrl}</p>`;
  await sendingMail(user.email, subject, html);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Email sent",
    data: resetUrl,
    token: resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await db.User.findOne({
    where: {
      resetTokenHash: hashToken,
      resetTokenExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new ApiError("Invalid or Expire token", StatusCodes.BAD_REQUEST);
  }

  // console.log(req.body.password);
  // const hashedPass = await bcrypt.hash(req.body.password, 10);
  // console.log(hashedPass);
  await user.update({
    password: req.body.password,

    resetTokenHash: null,
    resetTokenExpires: null,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Password reset successfully!! Please Login..",
  });
});
