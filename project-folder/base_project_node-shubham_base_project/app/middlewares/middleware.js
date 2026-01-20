var jwt = require("jsonwebtoken");
const db = require("../db/models");
const { status, messages, common } = require("../../utils");
const { setContextValues } = require("../db/audit-logger/utils");

const authenticateUser = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization || null;
    if (!authHeader) {
      return res
        .status(status.Unauthorized)
        .json({ message: messages.unauthorized });
    }

    // Remove 'Bearer ' prefix if present
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    if (!decoded) {
      return res
        .status(status.Unauthorized)
        .json({ message: messages.unauthorized });
    }

    const user = await db.User.scope("withPassword").findOne({
      attributes: {
        exclude: [
          "createdAt",
          "createdBy",
          "updatedAt",
          "updatedBy",
          "deletedAt",
          "deletedBy",
        ],
      },
      where: { id: decoded.user.id, deletedAt: null, isActive: "1" },
      include: [
        {
          model: db.Role,
          as: "Role",
          attributes: ["id", "name", "isSystemAdmin", "isAdmin", "level"],
          where: {
            status: "1",
            deletedAt: null,
          },
        },
      ],
    });

    if (!user) {
      return res
        .status(status.Unauthorized)
        .json({ message: messages.unauthorized });
    }

    const session = await db.UserSession.findOne({
      where: {
        id: decoded.sessionId,
        deletedAt: null,
        logoutTime: null,
      },
    });

    if (!session) {
      return res
        .status(status.Unauthorized)
        .json({ data: "Session Expired", status: status.Unauthorized });
    }

    session.set({
      activeDate: await common.getDate(),
    });

    let sessionData = await session.save();

    req.userSession = sessionData;

    if (decoded?.user?.signature !== user.password.slice(-16)) {
      return res
        .status(status.Unauthorized)
        .json({ message: messages.unauthorized });
    }

    // Add the current user instance to request
    req.user = user;

    // Call the audit logger context
    return setContextValues(req, req.user, next);
  } catch (err) {
    console.error("Admin Middleware", err.message);
    return res
      .status(status.Unauthorized)
      .json({ message: messages.unauthorized });
  }
};

module.exports = authenticateUser;
