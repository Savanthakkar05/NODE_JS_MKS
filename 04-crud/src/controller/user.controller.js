const { User, Profile } = require("../models/index");
const { StatusCodes } = require("http-status-codes");
const register = async (req, res) => {
  try {
    const body = req.body;
    const { email } = body;
    // console.log(body);
    if (!body) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "Please Enter full data" });
    }
    const user = await User.findOne({ where: { email } });
    // console.log(user);
    if (user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "User already exist" });
    }

    const newUser = await User.create(req.body);

    // console.log(newUser.fullname);
    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "User create", user: newUser });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
    });

    return res
      .status(StatusCodes.OK)
      .json({ success: true, User: user ? user : [] });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["password"],
      },
    });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "User not Found" });
    }

    return res.status(StatusCodes.OK).json({ success: true, user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "User not Found" });
    }

    await User.destroy({ where: { id: userId } });
    return res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "User delete" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    console.log("sadas");
    const profile = await Profile.findAll({whe});
    console.log("==> ", profile);
    return res.status(StatusCodes.OK).json({ success: true, profile });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: error.message });
  }
};

module.exports = {
  register,
  getUsers,
  getUserById,
  deleteUserById,
  getProfile,
};
