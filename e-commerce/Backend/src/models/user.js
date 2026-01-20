"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Cart, {
        foreignKey: "userId",
        as: "carts",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }

    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          const hashedpass = bcrypt.hashSync(value, 10);
          this.setDataValue("password", hashedpass);
        },
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
        validate: {
          isIn: [["admin", "user", "guide"]],
        },
      },
      resetTokenHash: {
        type: DataTypes.STRING,
      },
      resetTokenExpires: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
