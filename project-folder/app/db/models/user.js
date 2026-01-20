"use strict";
const bcrypt = require("bcrypt");
const { convertJsonData } = require("../../../utils/lib/common-function");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: true,
        association: {
          model: "Role",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
          belongsToAlias: "Role",
          hasManyAlias: "Users",
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("email", value?.toLowerCase());
        },
        unique: {
          name: "user_email",
          msg: "Email already exists",
          ignoreDuplicates: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 10));
        },
      },
      profileImage: {
        type: Sequelize.TEXT,
        allowNull: true,
        get() {
          return convertJsonData(this.getDataValue("profileImage"));
        },
        set(value) {
          this.setDataValue(
            "profileImage",
            value ? JSON.stringify(value) : null,
          );
        },
      },
      coverImage: {
        type: Sequelize.TEXT,
        allowNull: true,
        get() {
          return convertJsonData(this.getDataValue("coverImage"));
        },
        set(value) {
          this.setDataValue("coverImage", value ? JSON.stringify(value) : null);
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      addressLine1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      addressLine2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM("1", "2", "3"),
        allowNull: true,
        comment: "1 for Male, 2 for Female, 3 for Other",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        onCreate: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    },
    {
      tableName: "user",
      indexes: [{ unique: true, fields: ["email"] }],
      customOptions: {
        createdBy: { value: true },
        updatedBy: { value: true },
        deletedBy: { value: true },
      },
      defaultScope: {
        attributes: {
          exclude: ["password"],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: ["password"],
          },
        },
      },
    },
  );

  User.hasAuditLogs();

  return User;
};
