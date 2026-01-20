const { common, logEnums } = require("../../utils");
const { getNamespace } = require("../../utils/asyncLocalStorage");
const config = require("../db/audit-logger/utils").getAuditConfig();

/**
 *
 * @param {*} operation operation being performed. Example - create, update, view, delete
 * @param {*} moduleId id of ModuleMaster being used
 * @param {*} moduleName if ModuleMaster is not created then name of the module
 */
function auditMiddleware(props) {
  return async (req, res, next) => {
    try {
      if (typeof props != "object") {
        throw new Error("Audit Middleware: Props must be of type object only.");
      } else if (Object.keys(props).length === 0) {
        throw new Error("Audit Middleware: Props cannot be blank object");
      }

      if (!props.operation) props.operation = logEnums.Operation.View;

      // for skipping audit logs
      if (!config.enable) return next();

      const namespace = getNamespace();

      Object.keys(props).forEach((key) => {
        namespace.set(`AM-${key}`, props[key]);
      });

      return next();
    } catch (err) {
      return common.throwException(err, "Audit Middleware", req, res);
    }
  };
}

module.exports = auditMiddleware;
