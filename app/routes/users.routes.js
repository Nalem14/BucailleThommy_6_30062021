const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/signup", userController.signup);
/**
 * @swagger
 *
 * /api/login:
 *   post:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
          in: body
          required: true
          type: string
        - name: password
          in: body
          required: true
          type: string
 */
router.post("/login", userController.login);

module.exports = router;