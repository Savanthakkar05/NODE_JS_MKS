const db = require("../models/index");
const { StatusCodes } = require("http-status-codes");
const generateTokens = require("../utils/generateToken");
const dotenv = require("dotenv");
dotenv.config();

const register = async (req, res) => {
  try {
    const user = await db.User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "User already exist!!" });
    }

    const newUser = await db.User.create(req.body);

    const { accessToken, refreshToken } = generateTokens(newUser);

    await db.RefreshToken.create({
      token: refreshToken,
      userId: newUser.id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User Registered",
      user: newUser,
      token: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: { email: req.body?.email },
      attributes: { exclude: ["password"] },
    });
    // console.log("Logged User : ", user);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "User not found!!" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await db.RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User Logged in....",
      user: user,
      token: { accessToken, refreshToken },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "User not Found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Profile data fetched", user: user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const logout = async (req, res) => {
  try {
    if (req.cookies?.refreshToken) {
      await db.RefreshToken.destroy({
        where: { token: req.cookies?.refreshToken },
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout Successfully.." });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
module.exports = { register, login, getProfile, logout };
