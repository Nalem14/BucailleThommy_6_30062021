const db = require("../models");
var path = require('path');
const Sauce = db.sauce;

// List sauces
exports.get = (req, res) => {
    try {
        let image = req.params.image
        res.sendFile(path.resolve(__dirname + "/../../public/images/" + image));
    }
    catch(error) {
        res.status(500).json({ error: error })
    }
};