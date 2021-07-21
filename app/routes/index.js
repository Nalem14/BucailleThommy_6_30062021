const express = require("express");
const router = express.Router();
const usersRoutes = require("./users.routes");
const saucesRoutes = require("./sauces.routes");
const imagesRoutes = require("./images.routes");
const authMiddleware = require("../middleware/auth.middleware");
const imageCheckerMiddleware = require("../middleware/imageChecker.middleware");
const bouncer = require('express-bouncer');

// Configure spam-protection
bouncer.whitelist.push('127.0.0.1'); // allow an IP address
// give a custom error message
bouncer.blocked = function (req, res, next, remaining) {
    res.send(429, "Vous avez effectué trop de requêtes. Ré-essayez dans " + remaining/1000 + " secondes.");
};

router.use("/api/sauces", authMiddleware, imageCheckerMiddleware, saucesRoutes);
router.use("/api/auth", bouncer.block, usersRoutes);
router.use("/api/image", imagesRoutes);

module.exports = router;