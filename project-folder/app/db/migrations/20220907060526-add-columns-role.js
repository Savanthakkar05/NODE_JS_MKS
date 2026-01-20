"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    return Promise.all([
      queryInterface.addColumn("role", "createdBy", {
        type: DataTypes.UUID,
        references: {
          model: "user",
          key: "id",
        },
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
      queryInterface.addColumn("role", "updatedBy", {
        type: DataTypes.UUID,
        references: {
          model: "user",
          key: "id",
        },
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
      queryInterface.addColumn("role", "deletedBy", {
        type: DataTypes.UUID,
        references: {
          model: "user",
          key: "id",
        },
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
    ]);
  },

  async down(queryInterface, DataTypes) {
    return Promise.all([
      queryInterface.removeColumn("role", "createdBy"),
      queryInterface.removeColumn("role", "updatedBy"),
      queryInterface.removeColumn("role", "deletedBy"),
    ]);
  },
};
