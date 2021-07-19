const express = require("express");
const router = express.Router();
const usersRoutes = require("./users.routes");
const saucesRoutes = require("./sauces.routes");
const imagesRoutes = require("./images.routes");
const auth = require("../middleware/auth");

router.use("/api/sauces", auth, saucesRoutes);
router.use("/api/auth", usersRoutes);
router.use("/api/image", imagesRoutes);

module.exports = router;