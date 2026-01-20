require("dotenv").config();

const config = {
  enable: process.env.AUDIT_ENABLE === "TRUE" ? true : false,
  enableAuditDetailModel:
    process.env.AUDIT_DETAIL_ENABLE === "TRUE" ? true : false,
  enableMongoAuditDetailModel:
    process.env.MONGO_AUDIT_DETAIL_ENABLE === "TRUE" ? true : false,
  debug: false,
  envExcludeRoutes:
    process.env.AUDIT_EXCLUDE_SERVER_SIDE_FILTERS === "TRUE" ? true : false,
  clsUser: "user",
  clsUserId: "userId",
  clsSessionId: "sessionId",
  clsModuleId: "moduleId",
  clsModule: "moduleName",
  clsAuditLogId: "auditLogId",
  clsStartTime: "startTime",
  clsOperation: "operation",
  clsTransaction: "transaction",
  clsBody: "body",
  requestPath: "requestPath",
  requestMethod: "requestMethod",
  schedulerName: "schedulerName",
  clientIP: "clientIP",
  userAgent: "userAgent",
  exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
};

module.exports = config;
