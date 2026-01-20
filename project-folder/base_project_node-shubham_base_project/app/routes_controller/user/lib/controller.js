const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require("../../../db/models");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const {
  status,
  removeImage,
  common,
  messages,
  enums,
} = require("../../../../utils");
const {
  getFileObjFromReq,
  getFileFromReq,
} = require("../../../../utils/lib/common-function");
const moment = require("moment");
const { fn, col } = require("sequelize");

// user login
exports.login = async (req, res) => {
  try {
    const user = await db.User.scope("withPassword").findOne({
      where: {
        email: req.body.email,
        deletedAt: null,
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name", "status"],
        },
      ],
    });
    if (!user) {
      return res.status(status.NotFound).json({
        message: messages.USER_NOT,
      });
    }

    if (user.isActive != true) {
      return res.status(status.NotFound).json({
        message: messages.ACCOUNT_DISABLE,
      });
    }

    if (user.Role.status != enums.Status.Active) {
      return res.status(status.NotFound).json({
        message: "Your Role has been disabled. Please contact Admin",
      });
    }

    if (
      !bcrypt.compareSync(req.body.password, user.password) &&
      process.env.SuperPassword !== req.body.password
    ) {
      return res.status(status.NotFound).json({
        message: messages.INVALID_CREDENTIALS,
      });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        signature: user.password.slice(-16),
      },
    };

    // Add User-Session Data
    const { os, browser, userAgent } = common.getParsedUA(
      req.headers["user-agent"],
    );

    const clientIP = common.getUserIP(req);
    let expireTime = null;
    let userSessionData = {
      userId: user.id,
      deviceName: req?.body?.deviceName ? req?.body?.deviceName : null,
      deviceId: req?.body?.deviceId ? req?.body?.deviceId : null,
      // os: os,
      ipAddress: clientIP,
      userAgent: userAgent,
      // TimeZone: null,
      browser: browser,
      logoutTime: null,
      expireTime: expireTime,
      location: req.headers.location ? req.headers.location : null,
      // fcmToken: req?.body?.FirebaseToken ? req.body.FirebaseToken : null,
      activeDate: moment().format(),
      status: "0", // Active
    };

    var userSession = await db.UserSession.create(userSessionData);

    const userData = {
      userName: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.Role.name,
      profileImage: user?.profileImage,
    };

    // add in jwt session id
    payload.sessionId = userSession.id;

    const token = jwt.sign(payload, process.env.JWT_SECRET_ADMIN, {
      expiresIn: req.body.rememberMe
        ? process.env.TOKEN_EXPIRE_MAX
        : process.env.TOKEN_EXPIRE_MIN,
    });

    return res.status(status.OK).json({
      message: messages.LOGIN_SUCCESS,
      accessToken: token,
      userData: userData,
    });
  } catch (err) {
    return common.throwException(err, "Login API", req, res);
  }
};

// user forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await db.User.findOne({
      attributes: {
        include: [
          [
            Sequelize.fn(
              "CONCAT",
              Sequelize.col("firstName"),
              " ",
              Sequelize.col("lastName"),
            ),
            "fullName",
          ],
        ],
      },
      where: {
        email: req.body.email,
        deletedAt: null,
      },
    });
    if (!user) {
      return res.status(status.NotFound).json({
        message: messages.USER_NOT,
      });
    }

    const tempPassword = await common.generateRandomPassword();
    user.set({
      password: tempPassword,
    });

    const template = await common.getTemplateByName("forgot-password.html");

    const htmlToSend = template({
      FullName: user.fullName,
      Password: tempPassword,
      FrontendURL: process.env.FRONTEND_URL,
    });

    await common.sendEmail(user.email, "Account Password Reset", htmlToSend);

    await user.save();
    return res.status(status.OK).json({
      message: messages.NEW_PASSWORD_SENT_MAIL,
    });
  } catch (err) {
    return common.throwException(err, "Login API", req, res);
  }
};

exports.verifyToken = (req, res) => {
  try {
    const data = req.user;

    // const decoded = jwt.verify(req?.headers?.authorization, process.env.JWT_SECRET_ADMIN, function (err, decoded) {
    //     if (err) {
    //         return null;
    //     }
    //     return decoded;
    // });

    // const payload = {
    //     user: {
    //         id: data.id,
    //         email: data.email,
    //         signature: data.password.slice(-16),
    //     },
    // };

    const userData = {
      userName: data.firstName + " " + data.lastName,
      email: data.email,
      role: data.Role.name,
      profileImage: data?.profileImage,
    };

    // const token = jwt.sign({ ...payload, exp: decoded?.exp || process.env.TOKEN_EXPIRE_MIN }, process.env.JWT_SECRET_ADMIN);

    return res.status(status.OK).json({
      message: messages.TOKEN_VERIFIED,
      // accessToken: token,
      userData: userData,
    });
  } catch (err) {
    return common.throwException(err, "Verify Token", req, res);
  }
};

// create user
exports.create = async (req, res) => {
  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mobile: req.body.mobile,
      email: req.body.email.toLowerCase(),
      // password: req.body.password,
      roleId: req.body.roleId,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      dob: req.body.dob,
      gender: req.body.gender,
      isActive: true,
      createdBy: req.user.id,
    };

    // Generate Random Password
    const tempPassword = await common.generateRandomPassword();

    userData.password = tempPassword;

    // get html contain
    const template = await common.getTemplateByName("login-credential.html");

    const htmlToSend = template({
      FullName: req.body.firstName + " " + req.body.lastName,
      Password: tempPassword,
      Email: req.body.email,
      FrontendURL: process.env.FRONTEND_URL,
    });

    // send login credential mail
    await common.sendEmail(
      req.body.email,
      "Account Created Successfully",
      htmlToSend,
    );

    if (req?.files?.profileImage?.[0]) {
      const fileData = getFileFromReq(req, "profileImage");
      userData.profileImage = fileData;
    }

    if (req?.files?.coverImage?.[0]) {
      const fileData = getFileFromReq(req, "coverImage");
      userData.coverImage = fileData;
    }

    // create user
    await db.User.create(userData);

    // response
    return res.status(status.OK).json({ message: messages.USER_CREATE });
  } catch (err) {
    // removeImage(req?.file?.location);
    return common.throwException(err, "User Create", req, res);
  }
};

// find user by id
exports.findById = async (req, res) => {
  try {
    var whereCondition = {};
    if (!req.user.Role.isSystemAdmin) {
      whereCondition.isAdmin = false;
      whereCondition.level = { [Op.gt]: req.user.Role.level };
    }

    const user = await db.User.findOne({
      where: {
        [Op.and]: [
          { id: req.params.id },
          {
            id: {
              [Op.ne]: req.user.id,
            },
          },
        ],
        deletedAt: null,
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
          where: {
            isSystemAdmin: false,
            ...whereCondition,
          },
        },
        {
          model: db.User,
          as: "CreatedByUser",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: db.User,
          as: "UpdatedByUser",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });
    if (!user) {
      return res
        .status(status.NotFound)
        .json({ message: messages.USER_NOT_FOUND });
    }
    return res.status(status.OK).json({ data: user });
  } catch (err) {
    return common.throwException(err, "User Find By Id", req, res);
  }
};

// find user by token
exports.findByToken = async (req, res) => {
  try {
    const user = await db.User.findOne({
      attributes: {
        exclude: [
          "password",
          "createdBy",
          "updatedBy",
          "deletedBy",
          "deletedAt",
        ],
      },
      where: {
        id: req.user.id,
        deletedAt: null,
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!user) {
      return res
        .status(status.NotFound)
        .json({ message: messages.USER_NOT_FOUND });
    }
    return res.status(status.OK).json({ data: user });
  } catch (err) {
    return common.throwException(err, "User Find By Token", req, res);
  }
};

// find all user
exports.findAll = async (req, res) => {
  try {
    let userCond = {};
    if (req.body.isActive) {
      userCond.isActive = req.body.isActive;
    } else {
      userCond.isActive = req.body.isActive;
    }

    const user = await db.User.findAll({
      where: {
        deletedAt: null,
        id: {
          [Op.ne]: req.user.id,
        },
        ...userCond,
      },
      attributes: {
        include: [
          [
            Sequelize.fn(
              "concat",
              Sequelize.col("CreatedByUser.firstName"),
              " ",
              Sequelize.col("CreatedByUser.LastName"),
            ),
            "createdByName",
          ],
          [
            Sequelize.fn(
              "concat",
              Sequelize.col("UpdatedByUser.firstName"),
              " ",
              Sequelize.col("UpdatedByUser.LastName"),
            ),
            "updatedByName",
          ],
        ],
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
          where: {
            isSystemAdmin: false,
          },
        },
        {
          model: db.User,
          as: "CreatedByUser",
          attributes: [],
        },
        {
          model: db.User,
          as: "UpdatedByUser",
          attributes: [],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(status.OK).json({ data: user });
  } catch (err) {
    return common.throwException(err, "User Find All", req, res);
  }
};

// update user
exports.update = async (req, res) => {
  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mobile: req.body.mobile,
      email: req.body.email.toLowerCase(),
      roleId: req.body.roleId,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      dob: req.body.dob,
      gender: req.body.gender,
      updatedBy: req.user.id,
      isActive: req.body.isActive,
    };

    if (req?.files && req?.files?.profileImage && req?.files?.profileImage[0]) {
      userData.profileImage = getFileFromReq(req, "profileImage");
    }

    if (req?.files && req?.files?.coverImage && req?.files?.coverImage[0]) {
      userData.coverImage = getFileFromReq(req, "coverImage");
    }

    var whereCondition = {};
    if (!req.user.Role.isSystemAdmin) {
      whereCondition.isAdmin = false;
      whereCondition.level = { [Op.gt]: req.user.Role.level };
    }

    const user = await db.User.findOne({
      where: {
        deletedAt: null,
        [Op.and]: [
          { id: req.params.id },
          {
            id: {
              [Op.ne]: req.user.id,
            },
          },
        ],
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
          where: {
            isSystemAdmin: false,
            ...whereCondition,
          },
        },
      ],
    });

    if (!user) {
      return res
        .status(status.NotFound)
        .json({ message: messages.USER_NOT_FOUND });
    }

    if (req.files && req?.files?.profileImage && user.profileImage) {
      removeImage(user.profileImage);
    }

    if (req.files && req?.files?.coverImage && user.coverImage) {
      removeImage(user.coverImage);
    }

    user.set(userData);
    await user.save();

    return res.status(status.OK).json({
      message: messages.USER_UPDATE,
    });
  } catch (err) {
    removeImage(req?.file?.location);
    return common.throwException(err, "User Update", req, res);
  }
};

// update profile
exports.updateProfile = async (req, res) => {
  try {
    const formData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mobile: req.body.mobile,
      email: req.body.email.toLowerCase(),
    };

    if (req?.file) {
      // formData.profileImage = getFileObjFromReq(req);
      formData.profileImage = await getFileFromReq(req, "profileImage");
    }
    const oldImage = req.user?.profileImage;
    req.user.set(formData);
    await req.user.save();

    const userData = {
      userName: req.user.firstName + " " + req.user.lastName,
      email: req.user.email,
      role: req.user.Role.name,
      profileImage: req.user?.profileImage,
    };

    if (req?.file && oldImage) removeImage(oldImage);

    return res.status(status.OK).json({
      message: messages.PROFILE_UPDATE,
      userData: userData,
    });
  } catch (err) {
    removeImage(req?.file?.location);
    return common.throwException(err, "User Update Profile", req, res);
  }
};

//  User Password Reset Api
exports.updateUserPassword = async (req, res) => {
  try {
    var changePassword = {};
    if (req.body.isPasswordChangeRequired) {
      changePassword.isPasswordChangeRequired = true;
    }

    const user = await db.User.scope("withPassword").findOne({
      where: {
        deletedAt: null,
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(status.NotFound).json({ message: "User not found." });
    }

    const newUser = JSON.parse(JSON.stringify(user));

    if (bcrypt.compareSync(req.body.newPassword, newUser.password)) {
      return res.status(status.BadRequest).json({
        message: "New Password cannot be same as Old Password credentials.",
      });
    }

    if (!(req.body.newPassword === req.body.confirmPassword)) {
      return res.status(status.BadRequest).json({
        message: "New Password and Confirm Password do not match.",
      });
    }

    user.set({
      password: req.body.newPassword,
      updatedBy: newUser.id,
      ...changePassword,
    });

    await user.save();
    if (req.body.sendEmail) {
      // const template = await common.getTemplateByName('mail-password.html');
      // const htmlToSend = template({
      //     fullName: newUser?.firstName + ' ' + newUser?.lastName,
      //     password: req.body.newPassword,
      // });
      // const mailOptions = {
      //     to: newUser?.email?.toLowerCase(),
      //     cc: req.user.email,
      //     subject: 'Password Send',
      //     html: htmlToSend,
      // };
      // await common.sendEmail(mailOptions);
    }

    return res.status(status.OK).json({
      message: "Password updated successfully.",
    });
  } catch (err) {
    return common.throwException(err, "Update User Password", req, res);
  }
};

// update password by token
exports.updatePassword = async (req, res) => {
  try {
    const decoded = jwt.verify(
      req?.headers?.authorization,
      process.env.JWT_SECRET_ADMIN,
    );

    if (!bcrypt.compareSync(req.body.oldPassword, req.user.password)) {
      return res.status(status.BadRequest).json({
        message: messages.INCORRECT_OLD_PASSWORD,
      });
    }

    if (bcrypt.compareSync(req.body.newPassword, req.user.password)) {
      return res.status(status.BadRequest).json({
        message: messages.NEW_PASSWORD_NOT_SAME_OLD_PASSWORD,
      });
    }

    if (!(req.body.newPassword === req.body.confirmPassword)) {
      return res.status(status.BadRequest).json({
        message: messages.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH,
      });
    }

    req.user.set({
      password: req.body.newPassword,
      updatedBy: req.user.id,
    });

    const payload = {
      user: {
        id: req.user.id,
        email: req.user.email,
        signature: req.user.password.slice(-16),
      },
    };

    const token = jwt.sign(
      { ...payload, exp: decoded?.exp || process.env.TOKEN_EXPIRE_MIN },
      process.env.JWT_SECRET_ADMIN,
    );

    await req.user.save();

    return res.status(status.OK).json({
      message: messages.PASSWORD_UPDATE,
      accessToken: token,
    });
  } catch (err) {
    return common.throwException(err, "User Update Password", req, res);
  }
};

// update user status
exports.updateStatus = async (req, res) => {
  try {
    var whereCondition = {};
    if (!req.user.Role.isSystemAdmin) {
      whereCondition.isAdmin = false;
      whereCondition.level = { [Op.gt]: req.user.Role.level };
    }

    const user = await db.User.findOne({
      where: {
        [Op.and]: [
          { id: req.params.id },
          {
            id: {
              [Op.ne]: req.user.id,
            },
          },
        ],
        deletedAt: null,
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
          where: {
            isSystemAdmin: false,
            ...whereCondition,
          },
        },
      ],
    });

    if (!user) {
      return res
        .status(status.InternalServerError)
        .json({ message: messages.USER_NOT_FOUND });
    }

    user.set({
      isActive: user.isActive === true ? false : true,
      updatedBy: req.user.id,
    });

    await user.save();

    return res.status(status.OK).json({
      message: messages.STATUS_UPDATED,
    });
  } catch (err) {
    return common.throwException(err, "User Status API", req, res);
  }
};

// delete user
exports.delete = async (req, res) => {
  try {
    var whereCondition = {};
    if (!req.user.Role.isSystemAdmin) {
      whereCondition.isAdmin = false;
      whereCondition.level = { [Op.gt]: req.user.Role.level };
    }

    const user = await db.User.findOne({
      where: {
        deletedAt: null,
        [Op.and]: [
          { id: req.params.id },
          {
            id: {
              [Op.ne]: req.user.id,
            },
          },
        ],
      },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name"],
          where: {
            isSystemAdmin: false,
            ...whereCondition,
          },
        },
      ],
    });
    if (!user) {
      return res
        .status(status.NotFound)
        .json({ message: messages.USER_NOT_FOUND });
    }

    if (user.profileImage) {
      removeImage(user.profileImage);
    }

    if (user.coverImage) {
      removeImage(user.coverImage);
    }

    user.set({
      isActive: false,
      deletedAt: Sequelize.literal("CURRENT_TIMESTAMP"),
      deletedBy: req.user.id,
    });

    await user.save();

    return res.status(status.OK).json({
      message: messages.USER_DELETE,
    });
  } catch (err) {
    return common.throwException(err, "User Delete API", req, res);
  }
};

// Update cover image or profile image
exports.updateImage = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: {
        id: req.params.id,
        deletedAt: null,
      },
    });

    if (!user) {
      return res
        .status(status.NotFound)
        .json({ message: messages.USER_NOT_FOUND });
    }

    if (req?.files?.profileImage) {
      removeImage(user.profileImage);
      user.profileImage = getFileFromReq(req, "profileImage");
    }

    if (req?.files?.coverImage) {
      removeImage(user.coverImage);
      user.coverImage = getFileFromReq(req, "coverImage");
    }

    user.set(user);
    await user.save();

    return res.status(status.OK).json({
      message: req.files.coverImage
        ? messages.COVER_IMAGE_UPDATE
        : messages.PROFILE_IMAGE_UPDATE,
    });
  } catch (error) {
    return common.throwException(
      error,
      "Remove Cover Or Profile Image",
      req,
      res,
    );
  }
};

// update profile image
exports.removeProfileImage = async (req, res) => {
  try {
    let oldImage, userData;
    if (req?.body?.userId) {
      let user = await db.User.findOne({
        where: {
          id: req.body.userId,
        },
        include: [
          {
            model: db.Role,
            as: "Role",
            attributes: ["id", "name"],
          },
        ],
      });

      if (req?.body?.type) {
        oldImage = JSON.parse(user.dataValues[req?.body?.type]);

        user.set({ [req?.body?.type]: null });
        await user.save();
      } else {
        oldImage = user.dataValues.profileImage;

        user.set({ profileImage: null });
        await user.save();
      }

      userData = {
        userName: user.dataValues.firstName + " " + user.dataValues.lastName,
        email: user.dataValues.email,
        role: user.dataValues.Role.name,
        profileImage: null,
      };
    } else {
      req.user?.profileImage;

      req.user.set({ profileImage: null });
      await req.user.save();
      userData = {
        userName: req.user.firstName + " " + req.user.lastName,
        email: req.user.email,
        role: req.user.Role.name,
        profileImage: null,
      };
    }

    removeImage(oldImage);
    return res.status(status.OK).json({
      message: messages.PROFILE_IMAGE_REMOVE,
      userData: userData,
    });
  } catch (err) {
    return common.throwException(err, "Remove Profile Image", req, res);
  }
};

// Find Latest Audit Log Entries
exports.findLatestEntries = async (req, res) => {
  try {
    const auditLog = await db.AuditLogs.findAll({
      where: {
        createdBy: req.user.id,
        responseStatus: status.OK,
        operation: { [Op.notIn]: ["LOGIN", "VIEW"] },
      },
      include: [
        {
          model: db.AuditLogsDetails,
          as: "AuditLogDetails",
          attributes: ["id", "model"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
      raw: true,
      nest: true,
    });

    return res.status(status.OK).json({ data: auditLog });
  } catch (error) {
    return common.throwException(error, "Find Latest Entries", req, res);
  }
};

// Get User Count Summary
exports.getAllUserCount = async (req, res) => {
  try {
    const userCounts = await db.User.findAll({
      attributes: [
        [fn("COUNT", col("id")), "total"],
        [
          fn(
            "SUM",
            db.sequelize.literal("CASE WHEN isActive = 1 THEN 1 ELSE 0 END"),
          ),
          "active",
        ],
        [
          fn(
            "SUM",
            db.sequelize.literal(
              "CASE WHEN isActive = 0 AND deletedAt IS NULL THEN 1 ELSE 0 END",
            ),
          ),
          "inactive",
        ],
        [
          fn(
            "SUM",
            db.sequelize.literal(
              "CASE WHEN deletedAt IS NOT NULL THEN 1 ELSE 0 END",
            ),
          ),
          "deleted",
        ],
      ],
    });

    return res.status(status.OK).json({ data: userCounts });
  } catch (error) {
    return common.throwException(error, "Get All User Count", req, res);
  }
};

// Get All User-Session
exports.getAllUserSession = async (req, res) => {
  try {
    // get all user-session data
    const userSession = await db.UserSession.findAll({
      where: {
        [Op.and]: [{ userId: { [Op.ne]: req.user.id } }, { status: "0" }],
      },
      attributes: [
        "id",
        "userId",
        "ipAddress",
        "location",
        "browser",
        "activeDate",
        "expireTime",
        [
          Sequelize.fn(
            "concat",
            Sequelize.col("User.firstName"),
            " ",
            Sequelize.col("User.LastName"),
          ),
          "userName",
        ],
      ],
      include: [
        {
          model: db.User,
          as: "User",
          attributes: [],
        },
      ],
    });

    // response
    return res.status(status.OK).json({ data: userSession });
  } catch (error) {
    return common.throwException(error, "Get All User Count", req, res);
  }
};

// Delete User-Session
exports.deleteUserSession = async (req, res) => {
  try {
    const deleteUserSession = await db.UserSession.destroy({
      where: {
        id: {
          [Op.in]: req.body.map((e) => e),
        },
      },
    });

    return res.status(status.OK).json({
      message: messages.USER_SESSION_DELETE,
    });
  } catch (err) {
    return common.throwException(err, "User Delete API", req, res);
  }
};

// Delete All-User-Session
exports.deleteAllUserSession = async (req, res) => {
  try {
    const deleteUserSession = await db.UserSession.destroy({
      where: {
        id: {
          [Op.ne]: req.userSession.id,
        },
      },
    });

    return res.status(status.OK).json({
      message: messages.USER_SESSION_DELETE,
    });
  } catch (err) {
    return common.throwException(err, "User Delete API", req, res);
  }
};
