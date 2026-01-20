"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    return Promise.all([
      queryInterface.addColumn("user", "roleId", {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "role",
          key: "id",
        },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
      }),
    ]);
  },

  async down(queryInterface, DataTypes) {
    return Promise.all([queryInterface.removeColumn("user", "roleId")]);
  },
};
