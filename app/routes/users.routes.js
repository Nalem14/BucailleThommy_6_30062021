const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/read-datas", authMiddleware, userController.readDatas);
router.get("/export-datas", authMiddleware, userController.exportDatas);
router.post("/report", authMiddleware, userController.report);
router.put("/update", authMiddleware, userController.update);
router.delete("/delete", authMiddleware, userController.delete);

module.exports = router;