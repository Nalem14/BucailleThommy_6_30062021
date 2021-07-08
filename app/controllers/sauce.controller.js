const db = require("../models");
const Sauce = db.sauce;

// List sauces
exports.list = (req, res) => {
    Sauce.find().then(datas => {
        res.status(200).json(datas);
    })
};

// Get specific sauce
exports.get = (req, res) => {
    Sauce.findOne(req.body.id).then(sauce => {
        if(!sauce) {
            return res.status(404).json({ error: "Cette sauce n'existe pas." });
        }

        res.status(200).json(sauce);
    });
};