/* eslint-disable no-console */
var _sequelize = require("sequelize");
var _lodash = require("lodash");
var _helpers = require("./helpers");
const { performance } = require("perf_hooks");
const common = require("../../../utils/lib/common-function");
const { getNamespace } = require("../../../utils/asyncLocalStorage");
const config = require("./config");
const AuditLog = require("../mongo-models/auditLog");
const { validate } = require("uuid");

exports.init = (sequelize) => {
  const log = config.log || console.log;

  function beforeHook(operation) {
    const beforeHook = async function beforeHook(instance, opt) {
      try {
        let namespace = getNamespace();

        if (!namespace) {
          if (config.debug) {
            log("namespace not available in beforeHook");
          }
          return;
        }
        if (opt && opt.disableLog) {
          if (config.debug) {
            // log('disableLog opt: is true, not logging');
          }
          return;
        }

        const auditLogId = namespace.get(config.clsAuditLogId);
        if (!auditLogId) {
          if (config.debug) {
            log("AuditLogId is not defined in beforeHook.");
          }
          return;
        }

        if (opt && opt.individualHooks) {
          if (config.debug) {
            log("individualHooks is true. Skipping bulk hook.");
          }
          return;
        }

        const destroyOperation = Array.isArray(instance)
          ? _helpers.checkDestroyOperation(
              operation,
              Array.from(instance[0]._changed),
            )
          : _helpers.checkDestroyOperation(
              operation,
              Array.from(instance._changed),
            );

        const instanceStartTime = performance.now();
        if (Array.isArray(instance)) {
          instance.forEach((ins) => {
            let previousVersion = ins._previousDataValues;
            let currentVersion = ins.dataValues;

            previousVersion = _lodash.omitBy(
              previousVersion,
              (i) => i != null && typeof i === "object" && !(i instanceof Date),
            );
            previousVersion = _lodash.omit(previousVersion, config.exclude);
            currentVersion = _lodash.omitBy(
              currentVersion,
              (i) => i != null && typeof i === "object" && !(i instanceof Date),
            );
            currentVersion = _lodash.omit(currentVersion, config.exclude);

            const { oldValues, newValues } = _helpers.getChangedColumns(
              currentVersion,
              previousVersion,
              ins._changed,
              config.exclude,
            );

            if (destroyOperation || (oldValues && newValues)) {
              if (!ins.context) {
                ins.context = {};
              }

              ins.context.opStartTime = instanceStartTime;
              ins.context.oldValues = oldValues;
              ins.context.newValues = newValues;
              ins.context.affectedColumns = _helpers.omitFromArray(
                Array.from(ins._changed),
                config.exclude,
              );
            }
          });
        } else {
          let previousVersion = instance._previousDataValues;
          let currentVersion = instance.dataValues;

          previousVersion = _lodash.omitBy(
            previousVersion,
            (i) => i != null && typeof i === "object" && !(i instanceof Date),
          );
          previousVersion = _lodash.omit(previousVersion, config.exclude);
          currentVersion = _lodash.omitBy(
            currentVersion,
            (i) => i != null && typeof i === "object" && !(i instanceof Date),
          );
          currentVersion = _lodash.omit(currentVersion, config.exclude);

          const { oldValues, newValues } = _helpers.getChangedColumns(
            currentVersion,
            previousVersion,
            instance._changed,
            config.exclude,
          );

          if (destroyOperation || (oldValues && newValues)) {
            if (!instance.context) {
              instance.context = {};
            }

            instance.context.opStartTime = instanceStartTime;
            instance.context.oldValues = oldValues;
            instance.context.newValues = newValues;
            instance.context.affectedColumns = _helpers.omitFromArray(
              Array.from(instance._changed),
              config.exclude,
            );
          }
        }
      } catch (error) {
        await common.throwException(error, "Create Audit Log Before Hook");
      }
    };
    return beforeHook;
  }

  function afterHook(operation) {
    const afterHook = async function afterHook(instance, opt) {
      try {
        let namespace = getNamespace();

        if (!namespace) {
          if (config.debug) {
            log("namespace not available in afterHook");
          }
          return;
        }

        if (opt && opt.disableLog) {
          if (config.debug) {
            // log('disableLog opt: is true, not logging');
          }
          return;
        }

        const auditLogId = namespace.get(config.clsAuditLogId);
        if (!auditLogId) {
          if (config.debug) {
            log("AuditLogId is not defined in afterHook.");
          }
          return;
        }

        if (opt && opt.individualHooks) {
          if (config.debug) {
            log("individualHooks is true. Skipping bulk hook.");
          }
          return;
        }

        const destroyOperation = Array.isArray(instance)
          ? _helpers.checkDestroyOperation(
              operation,
              Array.from(instance[0]._changed),
            )
          : _helpers.checkDestroyOperation(
              operation,
              Array.from(instance._changed),
            );

        const instanceEndTime = performance.now();

        if (Array.isArray(instance)) {
          const auditLogObject = {
            model: this.name,
          };
          const auditLogDetailObjects = [];
          instance.forEach((ins) => {
            if (
              ins.context &&
              ((ins.context.oldValues && ins.context.newValues) ||
                destroyOperation)
            ) {
              const duration = (
                instanceEndTime - ins.context.opStartTime
              ).toFixed(2);
              auditLogDetailObjects.push({
                documentId: ins.id,
                operation: destroyOperation
                  ? "DESTROY"
                  : operation.toUpperCase(),
                duration: duration,
                oldValues: ins.context.oldValues,
                newValues: ins.context.newValues,
                affectedColumns: ins.context.affectedColumns,
              });
            }
          });

          await createAuditLogDetail(
            auditLogObject,
            auditLogDetailObjects,
            opt,
            namespace,
          );
        } else {
          if (
            instance.context &&
            ((instance.context.oldValues && instance.context.newValues) ||
              destroyOperation)
          ) {
            const auditLogObject = {
              model: this.name,
            };
            const duration = (
              instanceEndTime - instance.context.opStartTime
            ).toFixed(2);
            const auditLogDetailObjects = [
              {
                documentId: instance.id,
                operation: destroyOperation
                  ? "DESTROY"
                  : operation.toUpperCase(),
                duration: duration,
                oldValues: instance.context.oldValues,
                newValues: instance.context.newValues,
                affectedColumns: instance.context.affectedColumns,
              },
            ];

            await createAuditLogDetail(
              auditLogObject,
              auditLogDetailObjects,
              opt,
              namespace,
            );
          }
        }

        return null;
      } catch (error) {
        await common.throwException(error, "Audit Create After Hook");
        return false;
      }
    };
    return afterHook;
  }

  function bulkBeforeHook(operation) {
    const bulkBeforeHook = async function bulkBeforeHook(instance, opt) {
      try {
        let namespace = getNamespace();

        if (!namespace) {
          if (config.debug) {
            log("namespace not available in bulkBeforeHook");
          }
          return;
        }

        const auditLogId = namespace.get(config.clsAuditLogId);
        if (!auditLogId) {
          if (config.debug) {
            log("AuditLogId is not defined in bulkBeforeHook.");
          }
          return;
        }

        if (opt && opt.disableLog) {
          if (config.debug) {
            log("disableLog opt: is true, not logging");
          }
          return;
        }

        if (opt && opt.individualHooks) {
          if (config.debug) {
            log("individualHooks is true. Skipping bulk hook.");
          }
          return;
        }

        if (!instance.fields) {
          instance.fields = [];
        }

        const destroyOperation = _helpers.checkDestroyOperation(
          instance.type || operation,
          instance.fields || [],
        );

        var transaction = null;

        if (instance.transaction) {
          transaction = instance.transaction;
        }

        const queryOptions = {};

        if (!destroyOperation) {
          queryOptions.attributes = ["id", ...instance.fields];
        }
        const rows = await this.findAll({
          ...queryOptions,
          where: instance.where,
          raw: true,
          transaction,
        });

        const auditData = [];
        const instanceStartTime = performance.now();

        rows.forEach((row) => {
          let previousVersion = row;
          let currentVersion = instance.attributes || {};

          previousVersion = _lodash.omitBy(
            previousVersion,
            (i) => i != null && typeof i === "object" && !(i instanceof Date),
          );
          previousVersion = _lodash.omit(previousVersion, config.exclude);
          currentVersion = _lodash.omitBy(
            currentVersion,
            (i) => i != null && typeof i === "object" && !(i instanceof Date),
          );
          currentVersion = _lodash.omit(currentVersion, config.exclude);

          const { oldValues, newValues, affectedColumns } =
            _helpers.getChangedColumns(
              currentVersion,
              previousVersion,
              instance.fields,
              config.exclude,
            );

          if (destroyOperation || (oldValues && newValues)) {
            const data = {
              documentId: row.id,
              oldValues: oldValues,
              newValues: newValues,
              affectedColumns: affectedColumns,
              operation: destroyOperation
                ? instance.type.toLowerCase() === "bulkdelete"
                  ? "HARD DELETE"
                  : "DELETE"
                : operation.toUpperCase(),
            };

            if (instance.type.toLowerCase() === "bulkdelete") {
              data.oldValues = previousVersion;
              data.newValues = null;
              data.affectedColumns = null;
            }
            auditData.push(data);
          }
        });

        instance.auditData = auditData;
        instance.opStartTime = instanceStartTime;
      } catch (error) {
        console.log(error);
        await common.throwException(error, "Create Audit Log Bulk Before Hook");
      }
    };
    return bulkBeforeHook;
  }

  function bulkAfterHook(operation) {
    const bulkAfterHook = async function bulkAfterHook(instance, opt) {
      try {
        let namespace = getNamespace();

        if (!namespace) {
          if (config.debug) {
            log("namespace not available in bulkAfterHook");
          }
          return;
        }

        const auditLogId = namespace.get(config.clsAuditLogId);
        if (!auditLogId) {
          if (config.debug) {
            log("AuditLogId is not defined in bulkAfterHook.");
          }
          return;
        }

        if (opt && opt.disableLog) {
          if (config.debug) {
            log("disableLog opt: is true, not logging");
          }
          return;
        }

        if (opt && opt.individualHooks) {
          if (config.debug) {
            log("individualHooks is true. Skipping bulk hook.");
          }
          return;
        }

        // eslint-disable-next-line no-unused-vars
        const destroyOperation = _helpers.checkDestroyOperation(
          instance.type || operation,
          instance.fields || [],
        );
        const instanceEndTime = performance.now() - instance.opStartTime;

        if (
          Array.isArray(instance.auditData) &&
          instance.auditData.length > 0
        ) {
          const auditLogObject = {
            model: this.name,
          };

          const auditLogDetailObjects = instance.auditData.map((ad) => {
            ad.duration = instanceEndTime;
            return ad;
          });

          var actionOptions = {};
          if (instance.transaction) {
            actionOptions.transaction = instance.transaction;
          }
          await createAuditLogDetail(
            auditLogObject,
            auditLogDetailObjects,
            actionOptions,
            namespace,
          );
        }

        return null;
      } catch (error) {
        await common.throwException(error, "Audit Create After Hook");
        return false;
      }
    };
    return bulkAfterHook;
  }

  async function createAuditLogDetail(
    auditLogObject,
    auditLogDetailObjects = [],
    opt,
    namespace,
  ) {
    try {
      auditLogDetailObjects
        .filter((f1) => f1?.affectedColumns?.length > 0)
        .map((item) => {
          let oldValues = item.oldValues || {};
          let newValues = item.newValues || {};

          let allKeys = new Set([
            ...Object.keys(oldValues),
            ...Object.keys(newValues),
          ]);

          allKeys.forEach(async (key) => {
            if (oldValues[key] !== newValues[key]) {
              if (validate(oldValues[key]) && validate(newValues[key])) {
                let model = sequelize.models[auditLogObject.model];
                if (model) {
                  let foreignKeyModel = Object.values(model.associations).find(
                    (assoc) => assoc.foreignKey === key,
                  );
                  if (foreignKeyModel) {
                    oldValues["foreignKeyData"] = [];
                    newValues["foreignKeyData"] = [];

                    oldValues["foreignKeyData"].push({
                      id: oldValues[key],
                      modelName: foreignKeyModel.target.name,
                    });

                    newValues["foreignKeyData"].push({
                      id: newValues[key],
                      modelName: foreignKeyModel.target.name,
                    });
                  }
                }
              }
            }
          });
        });

      // getting previously created AuditLog if from context if available
      var auditLogId = namespace.get(config.clsAuditLogId);

      if (!auditLogId) {
        if (config.debug) {
          log("AuditLogId is not defined in createAuditLogDetail.");
        }
        return;
      }

      if (config.enableAuditDetailModel) {
        const DataToAdd = auditLogDetailObjects.filter((row) => {
          const hasOld = row.oldValues && Object.keys(row.oldValues).length > 0;
          const hasNew = row.newValues && Object.keys(row.newValues).length > 0;
          return hasOld || hasNew;
        });

        DataToAdd.forEach((row) => {
          let cleanCol = row.operation.includes("CREATE");
          row.model = auditLogObject.model;
          row.oldValues = cleanCol ? null : row.oldValues;
          row.affectedColumns = cleanCol ? null : row.affectedColumns;
        });

        await AuditLog.findByIdAndUpdate(
          auditLogId,
          {
            $push: { AuditLogDetails: DataToAdd },
          },
          { new: true }, // Return updated document
        );
      }

      return true;
    } catch (error) {
      await common.throwException(error, "Create Audit Log Hook");
      return false;
    }
  }

  _lodash.assignIn(_sequelize.Model, {
    hasAuditLogs: function hasAuditLogs() {
      if (!config.enable) return true;
      if (config.debug) {
        this.options.auditEnabled = true;
      }

      // CREATE
      this.addHook("beforeCreate", beforeHook("create"));
      this.addHook("afterCreate", afterHook("create"));

      // UPDATE
      this.addHook("beforeUpdate", beforeHook("update"));
      this.addHook("afterUpdate", afterHook("update"));

      // DESTROY/DELETE
      this.addHook("beforeDestroy", beforeHook("destroy"));
      this.addHook("afterDestroy", afterHook("destroy"));

      // BULK CREATE
      this.addHook("beforeBulkCreate", beforeHook("bulkCreate"));
      this.addHook("afterBulkCreate", afterHook("bulkCreate"));

      // BULK UPDATE
      this.addHook("beforeBulkUpdate", bulkBeforeHook("bulkUpdate"));
      this.addHook("afterBulkUpdate", bulkAfterHook("bulkUpdate"));

      // BULK DESTROY/DELETE
      this.addHook("beforeBulkDestroy", bulkBeforeHook("bulkDelete"));
      this.addHook("afterBulkDestroy", bulkAfterHook("bulkDelete"));

      return true;
    },
  });

  return true;
};

module.exports = exports;
