const express = require("express");
const router = express.Router();
const usersRoutes = require("./users.routes");
const saucesRoutes = require("./sauces.routes");
const imagesRoutes = require("./images.routes");
const authMiddleware = require("../middleware/auth.middleware");
const imageCheckerMiddleware = require("../middleware/imageChecker.middleware");

router.use("/api/sauces", authMiddleware, imageCheckerMiddleware, saucesRoutes);
router.use("/api/auth", usersRoutes);
router.use("/api/image", imagesRoutes);

module.exports = router;