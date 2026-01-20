const { User, Orders } = require("../models");

const createUser = async (req, res) => {
  try {
    const user = await User.bulkCreate(req.body);
    return res.status(201).json({ user: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOrderwithUser = async (req, res) => {
  try {
    const userwithorder = await Orders.findAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    return res.status(200).json({ order: userwithorder });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = { createUser, getOrderwithUser };
