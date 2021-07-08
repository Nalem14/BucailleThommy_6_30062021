const db = require("../models");
const Sauce = db.sauce;

// List sauces
exports.list = (req, res) => {
    Sauce.find().then(datas => {
        if(datas.length == 0) {
            return res.status(401).json({ error: "Aucune souce n'est disponible" });
        }

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

// Add sauce
exports.add = (req, res) => {
    console.log(req.body);
    try {
        if(!req.files) {
            return res.status(401).json({
                message: 'Aucune image n\'a été envoyé.'
            });
        }

        let image = req.files.image;
        image.mv('../../public/images/' + image.name);

        const sauce = new Sauce(JSON.parse(req.body.sauce));
        sauce.save()
            .then(() => res.status(201).json({ message: 'La sauce a bien été ajoutée.' }))
            .catch(error => res.status(400).json({ error }));

    } catch (error) {
        res.status(500).json({ error: error });
    }
};