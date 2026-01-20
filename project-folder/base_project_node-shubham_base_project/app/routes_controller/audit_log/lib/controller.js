const { status, common, messages, mongoCommon } = require("../../../../utils");
const AuditLog = require("../../../db/mongo-models/auditLog");

// find by auditLog id
exports.findByAuditLogId = async (req, res) => {
  try {
    const auditLog = await AuditLog.findOne({
      _id: req?.params?.id,
    });

    if (!auditLog) {
      return res
        .status(status.OK)
        .json({ message: messages.audit_log_not_found });
    }

    return res.status(status.OK).json({ data: auditLog });
  } catch (err) {
    return await common.throwException(
      err,
      "Get AuditLogDetails By AuditLog Id",
      req,
      res
    );
  }
};

// find by auditLog by document id
exports.findAuditLogByDocumentId = async (req, res) => {
  try {
    const { id } = req.params;

    const logs = await AuditLog.aggregate([
      {
        $match: {
          "AuditLogsDetails.documentId": id,
        },
      },
      {
        $unwind: "$AuditLogsDetails",
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 1, // Hide field use 0
          requestMethod: 1,
          createdByUser: 1,
          moduleId: 1,
          moduleName: 1,
          createdAt: 1,
          updatedAt: 1,
          "AuditLogsDetails.documentId": 1,
          "AuditLogsDetails.model": 1,
          "AuditLogsDetails.oldValues": 1,
          "AuditLogsDetails.newValues": 1,
        },
      },
    ]);

    return res.status(status.OK).json({ data: logs });
  } catch (err) {
    return await common.throwException(
      err,
      "Get AuditLogDetails By AuditLog Id",
      req,
      res
    );
  }
};

exports.findAllWithFilters2 = async (req, res) => {
  try {
    let auditLogQuery = { deletedAt: null };

    let userProfile = req.userProfile?.id;
    if (req.parent?.id) {
      userProfile.userProfileId = req?.parent?.userProfileId;
    }
    if (req?.body) {
      auditLogQuery = await mongoCommon.mongoFilters(req.body);
    }

    if (req.body.projectId)
      auditLogQuery.conditions.projectId = req.body.projectId;

    let auditLogs;
    let totalCount;

    if (req.body.group && req.body.group.length > 0) {
      const IsDatePip = req.body.group[0].groupInterval === "year";
      const groupField = req.body.group[0].selector;
      const groupOrder = req.body.group[0].desc === false ? 1 : -1;

      const pipeline = [
        { $match: auditLogQuery.conditions },
        {
          $addFields: {
            isAuditLogDetails: {
              $gt: [{ $size: { $ifNull: ["$AuditLogsDetails", []] } }, 0],
            },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            items: { $push: "$$ROOT" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: { $month: "$items.createdAt" },
            },
            items: { $push: "$items" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month",
              day: { $dayOfMonth: "$items.createdAt" },
            },
            items: { $push: "$items" },
          },
        },
        {
          $group: {
            _id: { year: "$_id.year", month: "$_id.month" },
            days: {
              $push: {
                key: "$_id.day",
                items: null,
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.year",
            months: {
              $push: {
                key: "$_id.month",
                items: "$days",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            key: "$_id",
            items: "$months",
          },
        },
        { $sort: auditLogQuery.sort },
      ];

      // Append skip and limit stages if defined
      if (auditLogQuery.skip !== undefined) {
        pipeline.push({ $skip: auditLogQuery.skip });
      }

      if (auditLogQuery.limit !== undefined) {
        pipeline.push({ $limit: auditLogQuery.limit });
      }

      if (IsDatePip) {
        auditLogs = await AuditLog.aggregate(pipeline);
      } else {
        auditLogs = await AuditLog.aggregate([
          { $match: auditLogQuery.conditions },
          { $sort: auditLogQuery.sort },
          {
            $addFields: {
              isAuditLogDetails: {
                $gt: [{ $size: { $ifNull: ["$AuditLogsDetails", []] } }, 0],
              },
            },
          },
          {
            $group: {
              _id: `$${groupField}`,
              items: { $push: "$items" },
            },
          },
          {
            $project: {
              key: "$_id",
              items: 1,
              _id: 0,
            },
          },
          { $sort: { key: groupOrder } },
          { $skip: auditLogQuery.skip },
          { $limit: auditLogQuery.limit },
        ]);
      }

      totalCount = await AuditLog.countDocuments(auditLogQuery.conditions);
    } else {
      auditLogs = await AuditLog.find(auditLogQuery.conditions)
        .skip(auditLogQuery.skip)
        .limit(auditLogQuery.limit)
        .sort(auditLogQuery.sort);
      totalCount = await AuditLog.countDocuments(auditLogQuery.conditions);
    }
    let result = {
      data: auditLogs,
      totalCount: totalCount,
    };

    return res.status(status.OK).json({ data: result });
  } catch (error) {
    return await common.throwException(error, "Find All Audit Logs", req, res);
  }
};

/**
 * @description find by id audit log details
 * @param {*} req.params id
 * @param {*} res
 * @returns
 */
exports.auditLogDetails = async (req, res) => {
  try {
    const auditLogData = await AuditLog.findOne({
      _id: req?.params?.id,
    });

    if (!auditLogData) {
      return res
        .status(status.NotFound)
        .json({ message: messages.audit_log_not_found });
    }
    return res.status(status.OK).json({ data: auditLogData });
  } catch (error) {
    return await common.throwException(
      error,
      "Find Audit Log Details",
      req,
      res
    );
  }
};
