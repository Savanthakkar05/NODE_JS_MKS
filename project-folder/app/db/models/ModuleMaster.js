"use strict";
module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define(
    "Module",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("1", "2", "3"),
        allowNull: false,
        defaultValue: "1",
        comment: "1 for group, 2 for module, 3 for right",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        association: {
          model: "Module",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
          belongsToAlias: "Parent",
        },
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      route: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("1", "0"),
        allowNull: false,
        defaultValue: "1",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        onCreate: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "module_master",
      customOptions: {
        createdBy: { value: true },
        updatedBy: { value: true },
      },
    },
  );
  Module.hasAuditLogs();

  return Module;
};
