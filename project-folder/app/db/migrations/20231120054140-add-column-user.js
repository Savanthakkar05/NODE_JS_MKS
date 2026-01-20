"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("user", "createdBy", {
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
        after: "createdAt",
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
      queryInterface.addColumn("user", "updatedBy", {
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
        after: "updatedAt",
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
      queryInterface.addColumn("user", "deletedBy", {
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
        after: "deletedAt",
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn("user", "createdBy"),
      queryInterface.removeColumn("user", "updatedBy"),
      queryInterface.removeColumn("user", "deletedBy"),
    ]);
  },
};
