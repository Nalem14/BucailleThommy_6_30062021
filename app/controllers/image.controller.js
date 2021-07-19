var path = require('path');
const stringSanitizer = require("string-sanitizer");

// List sauces
exports.get = (req, res) => {
    try {
        let imageName = req.params.image.split(".");
        let image = stringSanitizer.sanitize(imageName[0]) + "." + stringSanitizer.sanitize(imageName[1]);
        res.sendFile(path.resolve(__dirname + "/../../public/images/" + image));
    }
    catch(error) {
        res.status(500).json({ error: error })
    }
};