const db = require("../models");
const Sauce = db.sauce;

// List sauces
exports.list = (req, res) => {
    // Get all sauces in DB
    Sauce.find().then(datas => {

        // If no sauces, return a message
        if(datas.length == 0) {
            return res.status(401).json({ error: "Aucune souce n'est disponible" });
        }

        // Return Sauce array
        res.status(200).json(datas);
    })
};

// Get specific sauce
exports.get = (req, res) => {
    // Search for a Sauce with specific ID
    Sauce.findById(req.params.id).then(sauce => {

        // If not exist, return an error
        if(!sauce) {
            return res.status(404).json({ error: "Cette sauce n'existe pas." });
        }

        // Return the Sauce object
        res.status(200).json(sauce);
    });
};

// Add sauce
exports.add = (req, res) => {
    try {
        let sauceData = JSON.parse(req.body.sauce);

        // Check if request contain files uploaded
        if(!req.files) {
            return res.status(401).json({
                message: 'Aucune image n\'a été envoyé.'
            });
        }

        // Get and move image to public folder
        let image = req.files.image;
        image.mv('./public/images/' + image.name);

        // Create the new Sauce object with datas in request
        const sauce = new Sauce({
            name: sauceData.name,
            userId: sauceData.userId,
            manufacturer: sauceData.manufacturer,
            description: sauceData.description,
            mainPepper: sauceData.mainPepper,
            imageUrl: "http://localhost:3000/api/image/" + image.name,
            heat: sauceData.heat
        });

        // Save Sauce in DB and return response message
        sauce.save()
            .then(() => res.status(201).json({ message: 'La sauce a bien été ajoutée.' }))
            .catch(error => res.status(400).json({ error }));

        // Reset all likes and dislikes
        resetLikesAndDislikes();

    } catch (error) {
        res.status(500).json({ error: error });
    }
};

function resetLikesAndDislikes() {
    // Update all sauces to reset likes, dislikes and users ref
    Sauce.updateMany({ }, { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] });
}