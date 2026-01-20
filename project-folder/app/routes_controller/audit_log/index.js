const router = require("express").Router();
const auth = require("../../middlewares/middleware");
const authPermission = require("../../middlewares/permission.middleware");
const controller = require("./lib/controller");
const { modules } = require("../../../utils");
const auditMiddleware = require("../../middlewares/audit.middleware");
const auditLogEnums = require("../../../utils/lib/auditLogEnums");

// get all AuditLogs
router.post(
  "/audit-logs/with-filters",
  auditMiddleware({
    moduleName: auditLogEnums.Module.AuditLog.name,
    operation: auditLogEnums.Operation.View,
  }),
  auth,
  //   authPermission([modules.setup_audit_logs]),
  controller.findAllWithFilters2
);

// get auditLogDetails by auditLogId
router.get(
  "/audit-logs/:id",
  auditMiddleware({
    moduleName: auditLogEnums.Module.AuditLog.name,
    operation: auditLogEnums.Operation.View,
  }),
  auth,
  //   authPermission([modules.setup_audit_logs]),
  controller.findByAuditLogId
);

// Get Change in specific field
router.get(
  "/audit-logs-specific/:id",
  auditMiddleware({
    moduleName: auditLogEnums.Module.AuditLog.name,
    operation: auditLogEnums.Operation.View,
  }),
  auth,
  //   authPermission([modules.setup_audit_logs]),
  controller.findAuditLogByDocumentId
);

router.get(
  "/audit-log-details/:id",
  auditMiddleware({
    moduleName: auditLogEnums.Module.AuditLog.name,
    operation: auditLogEnums.Operation.View,
  }),
  auth,
  //   authPermission([modules.setup_audit_logs]),
  controller.auditLogDetails
);

module.exports = router;
