// Pending Point Db-Type in AuditLogDetails , ProjectId and duration in string type

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    operation: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    moduleId: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    moduleName: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    deviceName: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    operatingSystem: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    browser: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    User: {
      userId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      userName: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      sessionId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      roleId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      roleName: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
    },
    mockedByUser: {
      userId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      userName: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      sessionId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      roleId: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
      roleName: {
        type: mongoose.SchemaTypes.String,
        required: false,
      },
    },
    module: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    requestPath: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    requestMethod: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    responseStatus: {
      type: mongoose.SchemaTypes.Number,
      allowNull: true,
    },
    error: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    responseMessage: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    errorPayload: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
      default: null,
    },
    duration: {
      type: mongoose.SchemaTypes.Decimal128,
      required: false,
    },
    isScheduler: {
      type: mongoose.SchemaTypes.String,
      required: true,
      default: false,
    },
    schedulerName: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    query: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    body: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    params: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    headers: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
      default: null,
    },
    ipAddress: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    auth: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
      default: true,
    },
    AuditLogDetails: [
      {
        documentId: {
          type: mongoose.SchemaTypes.String,
          required: false,
        },
        model: {
          type: mongoose.SchemaTypes.String,
          required: false,
        },
        duration: {
          type: mongoose.SchemaTypes.String,
          required: false,
        },
        oldValues: {
          type: mongoose.SchemaTypes.Mixed,
          required: false,
          default: null,
        },
        newValues: {
          type: mongoose.SchemaTypes.Mixed,
          required: false,
          default: null,
        },
        affectedColumns: {
          type: mongoose.SchemaTypes.Mixed,
          required: false,
          default: null,
        },
        operation: {
          type: mongoose.SchemaTypes.String,
          required: false,
        },
        query: {
          type: mongoose.SchemaTypes.Mixed,
          required: false,
          default: null,
        },
        body: {
          type: mongoose.SchemaTypes.Mixed,
          required: false,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("audit_log", AuditLogSchema);
module.exports = AuditLog;
