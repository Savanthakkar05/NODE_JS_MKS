"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("user", "coverImage", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn("user", "addressLine1", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("user", "addressLine2", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("user", "dob", {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }),
      queryInterface.addColumn("user", "gender", {
        type: Sequelize.ENUM("1", "2", "3"),
        allowNull: true,
        comment: "1 for Male, 2 for Female, 3 for Other",
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn("user", "coverImage"),
      queryInterface.removeColumn("user", "addressLine1"),
      queryInterface.removeColumn("user", "addressLine2"),
      queryInterface.removeColumn("user", "dob"),
      queryInterface.removeColumn("user", "gender"),
    ]);
  },
};
