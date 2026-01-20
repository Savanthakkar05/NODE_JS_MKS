const router = require("express").Router();
const auth = require("../../middlewares/middleware");
const controller = require("./lib/controller");
const { validationRules } = require("./lib/validation");

// Create Module
router.post("/module", auth, controller.create);

// Get All Module
router.get("/module", auth, controller.findAll);

// get module by id
router.get("/module/:id", auth, controller.findOne);

// update Module
router.put("/module/:id", auth, controller.update);

module.exports = router;
