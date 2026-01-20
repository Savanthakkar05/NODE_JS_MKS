const { status } = require("../../utils");
const { getNamespace } = require("../../utils/asyncLocalStorage");
const db = require("../db/models");
const { Op } = require("sequelize");
const config = require("../db/audit-logger/utils").getAuditConfig();

const checkPermission = async (user, pid) => {
  try {
    if (user?.Role?.isSystemAdmin) {
      return true;
    }
    const data = await db.Permission.findOne({
      where: { roleId: user.roleId, moduleId: { [Op.in]: pid } },
    });
    if (!data) {
      return false;
    }
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

/**
 *
 * @param {*} pid - Array of ModuleIds, ['0'] to allow only System Admin Role
 * @returns next() || res.status(403)
 */

const authPermission = (pid) => {
  return async (req, res, next) => {
    if (!Array.isArray(pid) || pid.length == 0) {
      pid = ["0"];
    }
    const access = await checkPermission(req.user, pid);
    if (!access) {
      return res
        .status(status.Forbidden)
        .json({ message: "You do not have the necessary permission." });
    }

    // Set ModuleId in session.
    if (pid[0] != "0" && config.enable) {
      // Get Session Namespace
      let namespace = getNamespace();
      namespace.set("moduleId", pid[0]);
    }

    next();
  };
};

module.exports = authPermission;
