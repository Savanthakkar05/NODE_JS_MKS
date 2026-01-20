const router = require("express").Router();

// Admin Routes
router.use("/", require("./admin.routes"));

module.exports = router;
