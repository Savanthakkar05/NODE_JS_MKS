const router = require("express").Router();

router.use("/", require("./user"));
router.use("/", require("./role"));
router.use("/", require("./module_master"));
router.use("/", require("./audit_log"));

module.exports = router;
