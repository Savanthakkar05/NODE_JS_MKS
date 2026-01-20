const config = require("./config");
const _ = require("lodash");
const { performance } = require("perf_hooks");
const {
  asyncLocalStorage,
  getNamespace,
} = require("../../../utils/asyncLocalStorage");
const {
  throwException,
  getUserIP,
  getParsedUA,
} = require("../../../utils/lib/common-function");
const status = require("../../../utils/lib/messages/api.response").status;

const AuditLog = require("../mongo-models/auditLog");

//? Add API endpoint here to disable audit tracking.
// const DisableAuditAPIs = ['/audit-logs/with-filters'];
//? Add base route here to exclude that API from Audit tracking.
const excludeRoutes = [
  "/token",
  "/permission",
  "/menu",
  "/audit-logs/with-filters",
  "/audit-logs/:id",
  "/project-setting",
  "/user/with-filters",
];

const isExactExcludedRoute = (route) => excludeRoutes.includes(route);

const setContextValues = async (req, res, next) => {
  // check if audit logger is enabled else return.
  if (!config.enable) return next();

  let namespace = getNamespace();

  let operation = namespace.get("AM-operation");

  // Testing
  // Print the HTTP method and route path
  // const method = req.method;
  // const routePath = req.route?.path || req.originalUrl;

  // if (method != 'GET') {
  //     console.info(`API Route Accessed: [${method}] [${routePath}] : Operation : [${operation}]`);
  // }

  // If Method is GET then no entry should be detected in the table as per config.
  if (
    !operation ||
    (process.env.AUDIT_LOG_EXCLUDE_METHODS &&
      process.env.AUDIT_LOG_EXCLUDE_METHODS?.split(",")?.includes(operation))
  ) {
    return next();
  }

  if (req?.route?.path) {
    if (isExactExcludedRoute(req.route.path)) {
      return next();
    } else if (
      req.route.path.endsWith("/with-filters") &&
      config.envExcludeRoutes
    ) {
      return next();
    }
  }

  // Adding the current user instance and request details in session context.
  namespace.set(config.clsUser, req?.user?.toJSON());
  namespace.set(config.clsUserId, req?.user?.id);
  namespace.set(config.clsSessionId, req?.userSession?.id);

  // Starting Audit Log for the API and with current user session.
  await StartAuditLog(req);
  return next();
};

async function responseOverwrite(req, res, next) {
  try {
    req.startTime = performance.now();
    const oldJSONRes = res.json;

    // check if audit logger is enabled else return.
    if (!config?.enable) {
      return next();
    }

    asyncLocalStorage.run(new Map(), () => {
      const namespace = getNamespace();

      let auditId = namespace.get(config.clsAuditLogId);

      namespace.set(config.clsStartTime, req.startTime);
      namespace.set(config.requestPath, req.originalUrl);
      namespace.set(config.clientIP, getUserIP(req));
      namespace.set(config.requestMethod, req.method);
      namespace.set(config.userAgent, req.headers["user-agent"]);

      if (req?.user) {
        namespace.set(config.clsUser, req?.user?.toJSON());
        namespace.set(config.clsUserId, req?.user?.id);
        namespace.set(config.clsSessionId, req?.userSession?.id);
      }

      res.json = async function (data) {
        if (
          !auditId &&
          res.statusCode != status.OK &&
          res.statusCode !== status.Unauthorized
        ) {
          await StartAuditLog(req);
        }
        EndAuditLog(req, res, data);
        return oldJSONRes.apply(res, arguments);
      };
      return next();
    });
  } catch (err) {
    await throwException(err, "Update Audit Log Duration", req, res);
  }
}

function getAuditConfig() {
  return config;
}

async function StartAuditLog(req = null, data = {}, schedulerName = null) {
  try {
    // Get Session namespace
    const namespace = getNamespace();

    var os = null,
      browser = null,
      // userAgent = null,
      clientIP = null,
      requestQuery = null,
      requestBody = null,
      requestParams = null,
      requestHeader = null;

    if (req) {
      // Client OS and Browser
      const parsedUA = getParsedUA(req?.headers["user-agent"]);
      os = parsedUA.os;
      browser = parsedUA.browser;
      browser = parsedUA.browser;
      // userAgent = parsedUA.userAgent;

      // Request Client IP.
      clientIP = getUserIP(req);

      // If request method is GET than take req.query.
      if (req.query && Object.keys(req.query).length > 0) {
        requestQuery = _.omit(req.query, [
          "password",
          "oldPassword",
          "newPassword",
          "confirmPassword",
        ]);
      }
      // If request method is POST/PUT/PATCH/DELETE than take req.body.
      if (req.body && Object.keys(req.body).length > 0) {
        requestBody = _.omit(req.body, [
          "password",
          "oldPassword",
          "newPassword",
          "confirmPassword",
        ]);
      }

      if (req.headers && Object.keys(req.headers).length > 0) {
        requestHeader = {
          host: req.headers?.host,
          userAgent: req?.headers["user-agent"],
          accept: req?.headers?.accept,
          contentType: req?.headers["content-type"],
          acceptEncoding: req?.headers["accept-encoding"],
        };
      }
    }

    if (!data.operation && schedulerName) data.operation = "SCHEDULER";

    const userSessionData = req?.userSession
      ? JSON.parse(JSON.stringify(req?.userSession))
      : {};

    var updateAuditData = new AuditLog({
      operation: data?.operation?.toUpperCase() || null,
      requestPath: req?.originalUrl?.split("?")?.[0] || null,
      requestMethod: req?.method || null,
      schedulerName: schedulerName,
      isScheduler: schedulerName ? true : false,
      query: requestQuery,
      headers: requestHeader,
      body: requestBody,
      params: requestParams,
      moduleId: data?.moduleId || null,
      moduleName: data?.moduleName || null,
      ipAddress: clientIP,
      deviceName: null,
      operatingSystem: os,
      browser: browser,
      createdBy: req?.user?.id || data?.userId || null,
      sessionId: req?.userSession?.id || data?.userSessionId || null,
      User: {
        userId: req?.user?.id || data?.userId || null,
        userName: req?.user?.fullName ?? null,
        sessionId: req.userSession?.id,
        roleId: req?.user?.roleId || data?.roleId || null,
        roleName: req?.user?.Role?.name || data?.Role?.name || null,
      },
      mockedByUser: userSessionData?.mockedByUserSessionId
        ? {
            sessionId: userSessionData?.mockedByUserSessionId,
            userId: userSessionData?.mockedByUserId,
            userName: userSessionData?.mockedByUserName,
            roleId: userSessionData?.mockedByUserRoleId,
            roleName: userSessionData?.mockedByUserRoleName,
          }
        : null,

      // createdByUser: req?.user?.firstName && req?.user?.lastName ? `${req.user.firstName} ${req.user.lastName}` : null,
      auth: req?.user ? true : false,
    });

    const auditLogDetailResp = await updateAuditData.save();

    // updating mongo auditLogId
    namespace.set(config.clsAuditLogId, auditLogDetailResp._id);

    return auditLogDetailResp._id;
  } catch (error) {
    throwException(error, "Start Audit Log", req);
    return false;
  }
}

async function EndAuditLog(req, res, responseData) {
  try {
    // get namespace.
    let namespace = getNamespace();
    if (!namespace) return true;

    // check if audit log is created.
    let auditLogId = namespace.get(config.clsAuditLogId);
    if (!auditLogId) return false;

    const userId = namespace.get(config.clsUserId);
    const sessionId = namespace.get(config.clsSessionId);
    let requestBody = null;
    // const requestBody = namespace.get(config.clsBody);
    // If request method is POST/PUT/PATCH/DELETE than take req.body.
    if (req.body && Object.keys(req.body).length > 0) {
      requestBody = _.omit(req.body, [
        "password",
        "oldPassword",
        "newPassword",
        "confirmPassword",
      ]);
    }
    // const responseStatus = res.statusCode;
    const contextData = {};
    namespace.forEach((value, key) => {
      if (key.startsWith("AM-")) {
        const newKey = key.split("AM-")[1];
        contextData[newKey] = namespace.get(key);
      }
    });

    // response message.
    var msg = null;
    var errMsg = null;
    var errorPayload = null;
    // If response data has message, add in db.
    if (
      typeof responseData === "object" &&
      Object.prototype.hasOwnProperty.call(responseData, "message")
    )
      msg = responseData.message;
    if (
      typeof responseData === "object" &&
      Object.prototype.hasOwnProperty.call(responseData, "error")
    )
      errMsg = responseData.error;

    if (typeof responseData === "object" && res.statusCode != status.OK) {
      errorPayload = _.omit(responseData, ["message"]);
    }

    // if auditLogId is available update the duration in column.
    const duration = (
      performance.now() - namespace.get(config.clsStartTime)
    ).toFixed(2);

    var updateAuditData = {
      duration: duration,
      responseStatus:
        res.statusCode === status.NotModified ? status.OK : res.statusCode,
      responseMessage: msg,
      error: errMsg,
      errorPayload: errorPayload,
      ...contextData,
    };

    if (userId && userId.length > 0) updateAuditData.userId = userId;
    if (sessionId && sessionId.length > 0)
      updateAuditData.sessionId = sessionId;
    if (requestBody && Object.keys(requestBody).length > 0)
      updateAuditData.body = requestBody;

    // Updating the document in MongoDB
    await AuditLog.findOneAndUpdate(
      { _id: auditLogId },
      { $set: updateAuditData },
      { new: true },
    );
  } catch (error) {
    return throwException(error, "End Audit Log", req);
  }
}

module.exports = {
  setContextValues,
  responseOverwrite,
  getAuditConfig,
  StartAuditLog,
  EndAuditLog,
  isExactExcludedRoute,
};
