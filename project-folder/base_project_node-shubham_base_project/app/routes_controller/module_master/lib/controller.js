const db = require("../../../db/models");
const {
  common,
  dbCommon,
  enums,
  status,
  messages,
} = require("../../../../utils");

// create module
exports.create = async (req, res) => {
  try {
    if (req.body.type === enums.ModuleType.Group) {
      if (req.body.name) {
        const uniqueFields = {
          model: db.Module.name,
          exclude: [],
          fields: [
            {
              field: "name",
              value: req.body.name.toLowerCase(),
              name: "Name",
            },
          ],
        };

        const response =
          await dbCommon.checkUniqueFieldsForModule(uniqueFields);

        if (response && response.status != status.OK) {
          return res.status(status.BadRequest).json({
            message: response?.message || "Some fields already exists.",
            fields: response?.fields,
          });
        }
      }
    }

    const formData = {
      name: req.body.name,
      label: req.body.name,
      type: req.body.type,
      icon: req.body.icon || null,
      description: req.body.description,
      route: req.body.route,
      createdBy: req.user.id,
    };

    if (req.body.type != enums.ModuleType.Rights || !req?.body.type) {
      let whereCondition = {};
      if (req.body.type == enums.ModuleType.Group || !req.body.type) {
        whereCondition.parentId = null;
        whereCondition.type = enums.ModuleType.Group;
      }
      if (req.body.type == enums.ModuleType.Module) {
        whereCondition.type = enums.ModuleType.Module;
        whereCondition.parentId = req.body.parentId;
      }

      const module = await db.Module.findOne({
        where: {
          ...whereCondition,
        },
        order: [["level", "DESC"]],
      });

      formData.level = module ? module.level + 1 : 1;
    }

    if (req.body?.parentId) {
      formData.parentId = req.body.parentId;
    }
    await db.Module.create(formData);

    dbCommon.jsonFromModule();
    return res.status(status.OK).json({ message: messages.MODULE_CREATE });
  } catch (error) {
    return common.throwException(err, "Created Module", req, res);
  }
};

// find all module
exports.findAll = async (req, res) => {
  try {
    var whereCondition = {};

    if (req.query?.status) {
      whereCondition.status = req.query?.status;
    }

    const data = await db.Module.findAll({
      where: {
        ...whereCondition,
      },
      include: [
        {
          model: db.Module,
          as: "Parent",
          attributes: ["id", "name", "type", "status"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    return res.status(status.OK).json({ data: data });
  } catch (err) {
    return common.throwException(err, "Get Module", req, res);
  }
};

// find one module
exports.findOne = async (req, res) => {
  try {
    const data = await db.Module.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db.Module,
          as: "Parent",
          attributes: ["id", "name", "type", "status"],
        },
      ],
    });
    if (!data) {
      return res
        .status(status.NotFound)
        .json({ message: messages.MODULE_NOT_FOUND });
    }
    return res.status(status.OK).json({ data: data });
  } catch (err) {
    return common.throwException(err, "Get Module By id", req, res);
  }
};

// update module
exports.update = async (req, res) => {
  try {
    if (req.body.type == enums.ModuleType.Group) {
      if (req.body.name) {
        const uniqueFields = {
          model: db.Module.name,
          exclude: [req.params.id],
          fields: [
            {
              field: "name",
              value: req.body.name.toLowerCase(),
              name: "Name",
            },
          ],
        };

        const response =
          await dbCommon.checkUniqueFieldsForModule(uniqueFields);

        if (response && response.status != status.OK) {
          return res.status(status.BadRequest).json({
            message: response?.message || "Some fields already exists.",
            fields: response?.fields,
          });
        }
      }
    }
    const formData = {
      name: req.body.name,
      icon: req.body.icon,
      label: req.body.name,
      type: req.body.type,
      description: req.body.description,
      route: req.body.route,
      updatedBy: req.user.id,
    };
    if (req.body?.parentId) {
      formData.parentId = req.body.parentId;
    }

    if (req.params.id == req.body.parentId) {
      return res
        .status(status.NotFound)
        .json({ message: "Can not point self." });
    }
    const module = await db.Module.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!module) {
      return res
        .status(status.NotFound)
        .json({ message: messages.MODULE_NOT_FOUND });
    }
    module.set(formData);
    await module.save();

    dbCommon.jsonFromModule();
    return res.status(status.OK).json({ message: messages.MODULE_UPDATE });
  } catch (err) {
    return common.throwException(err, "Update Module", req, res);
  }
};
