"use strict";

const { QueryTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Raw query
    const users = await queryInterface.sequelize.query(
      "SELECT id,firstName FROM Users",
      {
        type: QueryTypes.SELECT,
      }
    );
    console.log(users[0]);
    // await queryInterface.bulkInsert("Orders", [
    //   {
    //     productName: "colgate",
    //     username: users[0].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[0].id,
    //   },
    //   {
    //     productName: "pencil",
    //     username: users[1].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[1].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[3].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[3].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[1].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[1].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[1].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[1].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[2].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[2].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[0].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[0].id,
    //   },
    //   {
    //     productName: "colgate",
    //     username: users[6].firstName,
    //     address: "asdf",
    //     number: "951023416",
    //     user_id: users[6].id,
    //   },
    // ]);

    await queryInterface.bulkInsert("Orders", [
      {
        productName: "colgate",
        username: users[5].firstName,
        address: "asdf",
        number: "951023416",
        user_id: users[5].id,
      },
      {
        productName: "pencil",
        username: users[1].firstName,
        address: "asdf",
        number: "951023416",
        user_id: users[1].id,
      },
      {
        productName: "colgate",
        username: users[8].firstName,
        address: "asdf",
        number: "951023416",
        user_id: users[8].id,
      },
      {
        productName: "colgate",
        username: users[2].firstName,
        address: "asdf",
        number: "951023416",
        user_id: users[2].id,
      },
      {
        productName: "colgate",
        username: users[2].firstName,
        address: "asdf",
        number: "951023416",
        user_id: users[2].id,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Orders", null);
  },
};
