const express = require("express");
const router = express.Router();
const imageController = require("../controllers/image.controller");

router.get("/:image", imageController.get);

module.exports = router;