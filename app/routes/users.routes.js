const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/get-datas", authMiddleware, userController.getDatas);
router.get("/export-datas", authMiddleware, userController.exportDatas);

module.exports = router;