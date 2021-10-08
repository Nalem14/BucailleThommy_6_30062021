const express = require("express");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce.controller");

router.get("/", sauceCtrl.list);
router.get("/:id", sauceCtrl.get);
router.post("/", sauceCtrl.add);
router.post("/:id/like", sauceCtrl.like);
router.post("/:id/report", sauceCtrl.report);
router.put("/:id", sauceCtrl.update);
router.delete("/:id", sauceCtrl.delete);

module.exports = router;