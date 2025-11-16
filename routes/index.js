const { Router } = require("express");
const router = Router();

const authIndex = require("./authIndex");

// Mount authentication routes at root
router.use("/", authIndex);

module.exports = router;
