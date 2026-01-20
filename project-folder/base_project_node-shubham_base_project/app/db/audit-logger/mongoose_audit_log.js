const mongoose = require("mongoose");
const config = require("./config");
const { getNamespace } = require("../../../utils/asyncLocalStorage");
const { enums, common } = require("../../../utils");
const AuditLog = require("../mongo-models/auditLog");

// Exclude models from audit
const excludeModel = ["audit_log", "user_session"];

// keep reference to original methods
if (!mongoose.Model.prototype.$originalSave) {
  mongoose.Model.prototype.$originalSave = mongoose.Model.prototype.save;
}

if (!mongoose.Model.$originalInsertMany) {
  mongoose.Model.$originalInsertMany = mongoose.Model.insertMany;
}

if (!mongoose.Model.$originalUpdateMany) {
  mongoose.Model.$originalUpdateMany = mongoose.Model.updateMany;
}

if (!mongoose.Model.$originalFindOneAndUpdate) {
  mongoose.Model.$originalFindOneAndUpdate = mongoose.Model.findOneAndUpdate;
}

if (!mongoose.Model.$originalDeleteOne) {
  mongoose.Model.$originalDeleteOne = mongoose.Model.deleteOne;
}

if (!mongoose.Model.$originalDeleteMany) {
  mongoose.Model.$originalDeleteMany = mongoose.Model.deleteMany;
}

if (!mongoose.Model.$originalUpdateOne) {
  mongoose.Model.$originalUpdateOne = mongoose.Model.updateOne;
}

if (!mongoose.Model.$originalFindByIdAndUpdate) {
  mongoose.Model.$originalFindByIdAndUpdate = mongoose.Model.findByIdAndUpdate;
}

/**
 * @description Create audit log entry in AuditLog collection
 * @param {String} model - Mongoose model name
 * @param {Object|Array} auditLogDetails - Audit log details object(s)
 */
async function createAuditLogDetails(model, auditLogDetails) {
  try {
    if (!config.enable || excludeModel.includes(model)) return;

    const namespace = getNamespace();
    if (!namespace) return;

    const auditLogId = namespace.get(config.clsAuditLogId);
    if (!auditLogId) return;

    if (config?.enableMongoAuditDetailModel) {
      await AuditLog.findByIdAndUpdate(
        auditLogId,
        {
          $push: {
            AuditLogsDetails: {
              $each: Array.isArray(auditLogDetails)
                ? auditLogDetails
                : [auditLogDetails],
            },
          },
        },
        { new: true } // Return updated document
      );
    }

    return true;
  } catch (err) {
    await common.throwException(err, "Create Audit Log");
  }
}

function initAuditLogger() {
  /**
   * @description Override Mongoose save method to log CREATE and UPDATE operations
   * @param {...any} args - Arguments passed to mongoose save
   * @returns {Object} saved document
   */
  mongoose.Model.prototype.save = async function (...args) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return this.$originalSave(...args);
    }

    const startTime = performance.now();
    try {
      const isNew = this.isNew;
      const oldDoc = !isNew
        ? await this.constructor.findById(this._id).lean()
        : null;

      const result = await this.$originalSave(...args);
      const newDoc = result?.toObject ? result.toObject() : result;

      let affectedColumns = [];
      let oldValues = {};
      let newValues = {};

      if (isNew) {
        affectedColumns = Object.keys(newDoc);
        newValues = newDoc;
      } else {
        const allKeys = new Set([
          ...Object.keys(oldDoc),
          ...Object.keys(newDoc),
        ]);
        for (let key of allKeys) {
          if (String(oldDoc[key]) !== String(newDoc[key])) {
            affectedColumns.push(key);
            oldValues[key] = oldDoc[key];
            newValues[key] = newDoc[key];
          }
        }
      }

      const auditLogDetail = {
        dbType: enums.dbType.mongo,
        documentId: oldDoc?._id || newDoc?._id,
        model: this.constructor.modelName,
        operation: isNew ? "CREATE" : oldDoc?.isDeleted ? "DELETE" : "UPDATE",
        oldValues: isNew ? null : oldValues,
        newValues,
        affectedColumns: isNew ? null : affectedColumns,
        query: null,
        body: null,
        duration: (performance.now() - startTime).toFixed(2),
      };

      await createAuditLogDetails(this.constructor.modelName, auditLogDetail);

      return result;
    } catch (err) {
      await common.throwException(err, "Save Audit Log");
    }
  };

  /**
   * @description Override Mongoose insertMany to log INSERTMANY operation
   * @param {Array} docs - documents to insert
   * @param {Object} options - mongoose options
   * @returns {Array} inserted documents
   */
  mongoose.Model.insertMany = async function (docs, options = {}) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return mongoose.Model.$originalInsertMany.call(this, docs, options);
    }

    const startTime = performance.now();
    try {
      const result = await mongoose.Model.$originalInsertMany.call(
        this,
        docs,
        options
      );

      const auditLogDetails = result.map((doc) => {
        const newDoc = doc?.toObject ? doc.toObject() : doc;
        return {
          dbType: enums.dbType.mongo,
          documentId: newDoc._id,
          model: this.modelName,
          operation: "INSERTMANY",
          oldValues: null,
          newValues: newDoc,
          affectedColumns: null,
          query: null,
          body: null,
          duration: (performance.now() - startTime).toFixed(2),
        };
      });

      await createAuditLogDetails(this.modelName, auditLogDetails);

      return result;
    } catch (err) {
      await common.throwException(err, "InsertMany Audit Log");
    }
  };

  /**
   * @description Override Mongoose updateMany to log UPDATEMANY operation
   * @param {Object} filter - filter query
   * @param {Object} update - update operations
   * @param {Object} options - mongoose options
   * @returns {Object} update result
   */
  mongoose.Model.updateMany = async function (filter, update, options = {}) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return mongoose.Model.$originalUpdateMany.call(
        this,
        filter,
        update,
        options
      );
    }

    const startTime = performance.now();
    try {
      // get docs before update
      const oldDocs = await this.find(filter).lean();

      const result = await mongoose.Model.$originalUpdateMany.call(
        this,
        filter,
        update,
        options
      );

      // get docs after update
      const newDocs = await this.find(filter).lean();

      const auditLogDetails = [];

      for (let newDoc of newDocs) {
        const oldDoc = oldDocs.find(
          (o) => String(o._id) === String(newDoc._id)
        );

        let affectedColumns = [];
        let oldValues = {};
        let newValues = {};

        if (oldDoc) {
          const allKeys = new Set([
            ...Object.keys(oldDoc),
            ...Object.keys(newDoc),
          ]);
          for (let key of allKeys) {
            if (String(oldDoc[key]) !== String(newDoc[key])) {
              affectedColumns.push(key);
              oldValues[key] = oldDoc[key];
              newValues[key] = newDoc[key];
            }
          }
        }

        auditLogDetails.push({
          dbType: enums.dbType.mongo,
          documentId: newDoc._id,
          model: this.modelName,
          operation: newDoc?.isDeleted ? "DELETE" : "UPDATEMANY",
          oldValues: Object.keys(oldValues).length ? oldValues : null,
          newValues: Object.keys(newValues).length ? newValues : null,
          affectedColumns: affectedColumns.length ? affectedColumns : null,
          query: filter,
          body: update,
          duration: (performance.now() - startTime).toFixed(2),
        });
      }

      if (auditLogDetails.length > 0) {
        await createAuditLogDetails(this.modelName, auditLogDetails);
      }

      return result;
    } catch (err) {
      await common.throwException(err, "UpdateMany Audit Log");
    }
  };

  /**
   * @description Override Mongoose findOneAndUpdate to log FINDONEANDUPDATE operation
   * @param {Object} filter - filter query
   * @param {Object} update - update operations
   * @param {Object} options - mongoose options
   * @returns {Object} updated document
   */
  mongoose.Model.findOneAndUpdate = async function (
    filter,
    update,
    options = {}
  ) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return mongoose.Model.$originalFindOneAndUpdate.call(
        this,
        filter,
        update,
        options
      );
    }

    const startTime = performance.now();
    try {
      // get old doc
      const oldDoc = await this.findOne(filter).lean();
      if (!oldDoc) return null; // nothing to update

      // perform update
      const result = await mongoose.Model.$originalFindOneAndUpdate.call(
        this,
        filter,
        update,
        options
      );

      // get updated doc
      const newDoc = await this.findOne(filter).lean();

      let affectedColumns = [];
      let oldValues = {};
      let newValues = {};

      const allKeys = new Set([...Object.keys(oldDoc), ...Object.keys(newDoc)]);
      for (let key of allKeys) {
        if (String(oldDoc[key]) !== String(newDoc[key])) {
          affectedColumns.push(key);
          oldValues[key] = oldDoc[key];
          newValues[key] = newDoc[key];
        }
      }

      const auditLogDetail = {
        dbType: enums.dbType.mongo,
        documentId: newDoc._id,
        model: this.modelName,
        operation: newDoc?.isDeleted ? "DELETE" : "FINDONEANDUPDATE",
        oldValues: Object.keys(oldValues).length ? oldValues : null,
        newValues: Object.keys(newValues).length ? newValues : null,
        affectedColumns: affectedColumns.length ? affectedColumns : null,
        query: filter,
        body: update,
        duration: (performance.now() - startTime).toFixed(2),
      };

      await createAuditLogDetails(this.modelName, auditLogDetail);

      return result;
    } catch (err) {
      await common.throwException(err, "FindOneAndUpdate Audit Log");
    }
  };

  /**
   * @description Override Mongoose updateOne to log UPDATEONE operation
   * @param {Object} filter - filter query
   * @param {Object} update - update operations
   * @param {Object} options - mongoose options
   * @returns {Object} updated document
   */
  mongoose.Model.updateOne = async function (filter, update, options = {}) {
    if (!config?.enable) {
      return mongoose.Model.$originalUpdateOne.call(
        this,
        filter,
        update,
        options
      );
    }

    const startTime = performance.now();
    try {
      const oldDoc = await this.findOne(filter).lean();
      const result = await mongoose.Model.$originalUpdateOne.call(
        this,
        filter,
        update,
        options
      );
      const newDoc = await this.findOne(filter).lean();

      let affectedColumns = [];
      let oldValues = {};
      let newValues = {};

      if (oldDoc && newDoc) {
        const allKeys = new Set([
          ...Object.keys(oldDoc),
          ...Object.keys(newDoc),
        ]);
        for (let key of allKeys) {
          if (String(oldDoc[key]) !== String(newDoc[key])) {
            affectedColumns.push(key);
            oldValues[key] = oldDoc[key];
            newValues[key] = newDoc[key];
          }
        }
      }

      const auditLogDetail = {
        dbType: enums.dbType.mongo,
        documentId: newDoc?._id || oldDoc?._id,
        model: this.modelName,
        operation: newDoc?.isDeleted ? "DELETE" : "UPDATEONE",
        oldValues: Object.keys(oldValues).length ? oldValues : null,
        newValues: Object.keys(newValues).length ? newValues : null,
        affectedColumns: affectedColumns.length ? affectedColumns : null,
        query: filter,
        body: update,
        duration: (performance.now() - startTime).toFixed(2),
      };

      await createAuditLogDetails(this.modelName, auditLogDetail);
      return result;
    } catch (err) {
      await common.throwException(err, "UpdateOne Audit Log");
    }
  };

  /**
   * @description Override Mongoose deleteOne to log DELETEONE operation
   * @param {Object} filter - filter query
   * @param {Object} options - mongoose options
   * @returns {Object} delete result
   */
  mongoose.Model.deleteOne = async function (filter, options = {}) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return mongoose.Model.$originalDeleteOne.call(this, filter, options);
    }

    const startTime = performance.now();
    try {
      const oldDoc = await this.findOne(filter).lean();

      const result = await mongoose.Model.$originalDeleteOne.call(
        this,
        filter,
        options
      );

      const auditLogDetail = {
        dbType: enums.dbType.mongo,
        documentId: oldDoc?._id,
        model: this.modelName,
        operation: "HARD DELETE",
        oldValues: oldDoc,
        newValues: null,
        affectedColumns: null,
        query: filter,
        body: null,
        duration: (performance.now() - startTime).toFixed(2),
      };

      await createAuditLogDetails(this.modelName, auditLogDetail);

      return result;
    } catch (err) {
      await common.throwException(err, "DeleteOne Audit Log");
    }
  };

  /**
   * @description Override Mongoose deleteMany to log DELETEMANY operation
   * @param {Object} filter - filter query
   * @param {Object} options - mongoose options
   * @returns {Object} delete result
   */
  mongoose.Model.deleteMany = async function (filter, options = {}) {
    // check if audit logger is enabled else skip logging
    if (!config?.enable) {
      return mongoose.Model.$originalDeleteMany.call(this, filter, options);
    }

    const startTime = performance.now();
    try {
      const oldDocs = await this.find(filter).lean();

      const result = await mongoose.Model.$originalDeleteMany.call(
        this,
        filter,
        options
      );

      const auditLogDetails = oldDocs.map((doc) => ({
        dbType: enums.dbType.mongo,
        documentId: doc._id,
        model: this.modelName,
        operation: "HARD DELETE",
        oldValues: doc,
        newValues: null,
        affectedColumns: null,
        query: filter,
        body: null,
        duration: (performance.now() - startTime).toFixed(2),
      }));

      await createAuditLogDetails(this.modelName, auditLogDetails);

      return result;
    } catch (err) {
      await common.throwException(err, "DeleteMany Audit Log");
    }
  };
}

module.exports = { initAuditLogger };
