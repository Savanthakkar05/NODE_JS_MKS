"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define(
    "UserSession",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        association: {
          model: "User",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          belongsToAlias: "User",
          hasManyAlias: "Sessions",
        },
      },

      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      browser: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
      },
      logoutTime: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      expireTime: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      activeDate: {
        allowNull: false,
        type: DataTypes.DATE,
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
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "user_session",
      // customOptions: {
      //   createdBy: { value: true },
      //   updatedBy: { value: true },
      //   deletedBy: { value: true },
      // },
      defaultScope: {
        where: {
          deletedAt: null,
        },
      },
      scopes: {
        withDeleted: {
          where: {},
        },
      },
    },
  );

  UserSession.hasAuditLogs();

  return UserSession;
};
