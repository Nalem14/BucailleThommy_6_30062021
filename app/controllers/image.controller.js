const db = require("../models");
var path = require('path');
const Sauce = db.sauce;
const stringSanitizer = require("string-sanitizer");

// List sauces
exports.get = (req, res) => {
    try {
        let image = stringSanitizer.sanitize(req.params.image);
        res.sendFile(path.resolve(__dirname + "/../../public/images/" + image));
    }
    catch(error) {
        res.status(500).json({ error: error })
    }
};