const express = require("express");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce.controller");

router.get("/", sauceCtrl.list);

/**
 * @swagger
 * 
 * /api/sauces/{id}:
 *   get:
 *     produces:
 *       - application/json
 *     tags: [Sauces]
 *     description: Get the list of all sauces
 *     security:
 *        - bearerAuth: []
 *     parameters:
 *        - name: id
 *          description: The sauce ID
 *          in: path
 *          required: true
 *          type: integer
 *          example: 60e6d87e80ef5f71eaa28a2a
 *     responses:
 *       200:
 *         description: Return an array with each sauces
 *       401:
 *         description: Return an object with a error message
 */
router.get("/:id", sauceCtrl.get);

/**
 * @swagger
 * 
 * /api/sauces:
 *   post:
 *     produces:
 *       - application/json
 *     tags: [Sauces]
 *     description: Add a new sauce
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *         - name: name
 *           description: The sauce name
 *           in: body
 *           required: true
 *           type: string
 *           example: Ketchup
 *         - name: userId
 *           description: The user ID
 *           in: body
 *           required: true
 *           type: string
 *           example: 60e2c6f4cf21ba52757cd5e8
 *         - name: manufacturer
 *           description: The manufacturer
 *           in: body
 *           required: true
 *           type: string
 *           example: Manufacturer name
 *         - name: description
 *           description: The sauce description
 *           in: body
 *           required: true
 *           type: string
 *           example: Description of the sauce
 *         - name: mainPepper
 *           description: The main pepper
 *           in: body
 *           required: true
 *           type: string
 *           example: Name of the main pepper
 *         - name: image
 *           description: A file image
 *           in: body
 *           required: true
 *           type: file
 *           example: File of the image
 *         - name: heat
 *           description: Heat value
 *           in: body
 *           required: true
 *           type: integer
 *           example: Heat of the image
 *     responses:
 *       200:
 *         description: Return an array with each sauces
 *       401:
 *         description: Return an object with a error message
 */
router.post("/", sauceCtrl.add);
router.post("/:id/like", sauceCtrl.like);
router.put("/:id", sauceCtrl.update);
router.delete("/:id", sauceCtrl.delete);

module.exports = router;