"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("user_session", {
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
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_session");
  },
};
