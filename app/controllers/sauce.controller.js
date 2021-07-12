const db = require("../models");
const Sauce = db.sauce;
const User = db.user;

// List sauces
exports.list = (req, res) => {
    // Get all sauces in DB
    Sauce.find().then(datas => {

        // If no sauces, return a message
        if(datas.length == 0) {
            return res.status(401).json({ error: "Aucune souce n'est disponible" });
        }

        // Set image URL
        for(var i = 0; i < datas.length; i++) {
            datas[i].imageUrl = req.protocol + '://' + req.get('host') + "/api/image/" + datas[i].imageUrl;
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

        // Set image URL
        sauce.imageUrl = req.protocol + '://' + req.get('host') + "/api/image/" + sauce.imageUrl;

        // Return the Sauce object
        res.status(200).json(sauce);
    });
};

// Like sauce
exports.like = (req, res) => {
    let userId = req.body.userId;
    let like = req.body.like;

    Sauce.findById(req.params.id).then(async sauce => {

        // If not exist, return an error
        if(!sauce) {
            return res.status(404).json({ error: "Cette sauce n'existe pas." });
        }

        let index = -1;
        /**
         * LIKE CHECK
         * If user like, add it to array and increment likes by 1
         * If user dislike or cancel like, remove it from usersLiked array and decrement likes by 1
         */
        index = sauce.usersLiked.indexOf(userId);
        if (index !== -1) {
            // Dislike or cancel like
            if(like == 0 || like == -1) {
                sauce.usersLiked.splice(index, 1);
                if(like == 0)
                    sauce.likes -= 1;
            }
        }

        // Like
         if(like == 1) {
            if(index === -1)
                sauce.usersLiked.push(userId);
            sauce.likes += 1;
        }

        /**
         * DISLIKE CHECK
         * If user dislike, add it to array and decrement likes by 1
         * If user like or cancel dislike, remove it from usersDisliked array and increment likes by 1
         */
        index = sauce.usersDisliked.indexOf(userId);
        if (index !== -1) {
            // Like or cancel dislike
            if(like == 0 || like == 1) {
                sauce.usersDisliked.splice(index, 1);
                if(like == 0)
                    sauce.dislikes -= 1;
            }
        }

        // Dislike
        if(like == -1) {
            if(index === -1)
                sauce.usersDisliked.push(userId);
            sauce.dislikes += 1;
        }

        // Save the sauce and return response messsage
        Sauce.findByIdAndUpdate(sauce._id, sauce).then(() => res.status(200).json({ message: 'Votre like a été mis à jour.' }))
        .catch(error => res.status(400).json({ error }));
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
            imageUrl: image.name,
            heat: sauceData.heat
        });

        // Update all sauces to reset likes, dislikes and users ref
        Sauce.updateMany({ }, { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] }, (err, result) => {
            if(err) {
                return res.status(400).json({ error: err });
            }

            // Save Sauce in DB and return response message
            sauce.save()
            .then(() => res.status(201).json({ message: 'La sauce a bien été ajoutée.' }))
            .catch(error => res.status(400).json({ error: error }));
        });

    } catch (error) {
        res.status(500).json({ error: error });
    }
};

// Update sauce
exports.update = async (req, res) => {
    try {
        const sauce = await Sauce.findById(req.params.id);
        // If not exist, return an error
        if(!sauce) {
            return res.status(404).json({ error: "Cette sauce n'existe pas." });
        }

        // Define data to null
        let sauceData = null;

        // Check if request contain files uploaded
        if(!req.files) {
            // If no image to update, sauce datas are in body
            sauceData = req.body;
        }else{
            // If request contain image, sauce datas are in body.sauce
            sauceData = JSON.parse(req.body.sauce);

            // Get and move image to public folder
            let image = req.files.image;
            image.mv('./public/images/' + image.name);

            // Update imageUrl in Sauce object
            sauce.imageUrl = image.name;
        }

        // Update the Sauce object with new datas
        sauce.name = sauceData.name;
        sauce.manufacturer = sauceData.manufacturer;
        sauce.description = sauceData.description;
        sauce.mainPepper = sauceData.mainPepper;
        sauce.heat = sauceData.heat;


        // Save Sauce in DB and return response message
        sauce.save()
            .then(() => res.status(201).json({ message: 'La sauce a bien été modifiée.' }))
            .catch(error => res.status(400).json({ error }));

    } catch (error) {
        res.status(500).json({ error: error });
    }
};

// Delete sauce
exports.delete = (req, res) => {
    Sauce.findById(req.params.id).then(sauce => {
        // If not exist, return an error
        if(!sauce) {
            return res.status(404).json({ error: "Cette sauce n'existe pas." });
        }

        Sauce.findByIdAndRemove(sauce._id, (err, doc) => {
            if(err) {
                return res.status(400).json({ error: err });
            }

            res.status(200).json({ message: "La sauce a bien été supprimé." });
        });
    });
}