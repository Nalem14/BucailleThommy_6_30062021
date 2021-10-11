const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Sauce = require("../models/sauce.model")(mongoose);
const fs = require("fs");

// List sauces
exports.readAll = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Get all sauces in DB
  Sauce.find().then((datas) => {
    // If no sauces, return a message
    if (datas.length == 0) {
      return res.status(401).json({ error: "Aucune sauce n'est disponible" });
    }

    // Set image URL
    for (var i = 0; i < datas.length; i++) {
      let sauce = datas[i];

      datas[i].imageUrl = baseUri + "/images/" + datas[i].imageUrl;
      datas[i] = { ...sauce._doc, links: [] };
      datas[i].links = hateoasLinks(req, sauce._id);
    }

    // Return Sauce array
    res.status(200).json(datas);
  });
};

// Get specific sauce
exports.readOne = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Search for a Sauce with specific ID
  Sauce.findById(req.params.id).then((sauce) => {
    // If not exist, return an error
    if (!sauce) {
      return res.status(404).json({ error: "Cette sauce n'existe pas." });
    }

    // Set image URL
    sauce.imageUrl = baseUri + "/images/" + sauce.imageUrl;

    // Return the Sauce object
    res.status(200).json(sauce, hateoasLinks(req, sauce._id));
  });
};

// Like sauce
exports.like = (req, res) => {
  let userId = req.body.userId;
  let like = req.body.like;

  Sauce.findById(req.params.id).then(async (sauce) => {
    // If not exist, return an error
    if (!sauce) {
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
      if (like == 0 || like == -1) {
        sauce.usersLiked.splice(index, 1);
        sauce.likes -= 1;
      }
    }

    // Like
    if (like == 1) {
      if (index === -1) {
        sauce.usersLiked.push(userId);
        sauce.likes += 1;
      }
    }

    /**
     * DISLIKE CHECK
     * If user dislike, add it to array and decrement likes by 1
     * If user like or cancel dislike, remove it from usersDisliked array and increment likes by 1
     */
    index = sauce.usersDisliked.indexOf(userId);
    if (index !== -1) {
      // Like or cancel dislike
      if (like == 0 || like == 1) {
        sauce.usersDisliked.splice(index, 1);
        sauce.dislikes -= 1;
      }
    }

    // Dislike
    if (like == -1) {
      if (index === -1) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes += 1;
      }
    }

    // Save the sauce and return response messsage
    Sauce.findByIdAndUpdate(sauce._id, sauce)
      .then(() =>
        res.status(200).json({ message: "Votre like a été mis à jour." }, hateoasLinks(req, sauce._id))
      )
      .catch((error) => res.status(400).json({ error }));
  });
};

// Add sauce
exports.add = (req, res) => {

  try {
    let sauceData = JSON.parse(req.body.sauce);

    // Check if request contain files uploaded
    if (!req.files) {
      return res.status(401).json({
        message: "Aucune image n'a été envoyé.",
      });
    }

    // Get image file
    let image = req.files.image;
    // Move image to public folder
    image.mv("./public/images/" + image.name);

    // Create the new Sauce object with datas in request
    const sauce = new Sauce({
      name: sauceData.name,
      userId: sauceData.userId,
      manufacturer: sauceData.manufacturer,
      description: sauceData.description,
      mainPepper: sauceData.mainPepper,
      imageUrl: image.name,
      heat: sauceData.heat,
    });

    // Update all sauces to reset likes, dislikes and users ref
    Sauce.updateMany(
      {},
      { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] },
      (err, result) => {
        if (err) {
          return res.status(400).json({ error: err });
        }

        // Save Sauce in DB and return response message
        sauce
          .save()
          .then(() =>
            res.status(201).json({ message: "La sauce a bien été ajoutée." }, hateoasLinks(req, sauce._id))
          )
          .catch((error) => res.status(400).json({ error: error }));
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

// Update sauce
exports.update = async (req, res) => {

  try {
    const sauce = await Sauce.findById(req.params.id);
    // If not exist, return an error
    if (!sauce) {
      return res.status(404).json({ error: "Cette sauce n'existe pas." });
    }

    // Define data to null
    let sauceData = null;

    // Check if request contain files uploaded
    if (!req.files) {
      // If no image to update, sauce datas are in body
      sauceData = req.body;
    } else {
      // If request contain image, sauce datas are in body.sauce
      sauceData = JSON.parse(req.body.sauce);

      // Delete the old image
      try {
        fs.unlinkSync("./public/images/" + sauce.imageUrl);
      } catch (er) {
        console.log(er);
      }

      // Get image file
      let image = req.files.image;
      // Move image to public folder
      image.mv("./public/images/" + image.name);

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
    sauce
      .save()
      .then(() =>
        res.status(201).json({ message: "La sauce a bien été modifiée." }, hateoasLinks(req, sauce._id))
      )
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

// Delete sauce
exports.delete = (req, res) => {

  Sauce.findById(req.params.id).then((sauce) => {
    // If not exist, return an error
    if (!sauce) {
      return res.status(404).json({ error: "Cette sauce n'existe pas." });
    }

    // Delete the image file
    try {
      fs.unlinkSync("./public/images/" + sauce.imageUrl);
    } catch (er) {
      console.log(er);
    }

    Sauce.findByIdAndRemove(sauce._id, (err, doc) => {
      if (err) {
        return res.status(400).json({ error: err });
      }

      res.status(200).json({ message: "La sauce a bien été supprimée." }, hateoasLinks(req, sauce._id));
    });
  });
};

// Report a sauce
exports.report = async (req, res) => {
  let userId = req.userId;

  // Sauce to re^prt
  Sauce.findById(req.params.id)
    .then((sauce) => {
      // If sauce to report not found, return an error
      if (!sauce) {
        return res.status(401).json({ error: "Sauce introuvable." });
      }

      if (sauce.usersAlert.indexOf(userId) === -1) {
        sauce.usersAlert.push(userId);
        try {
          sauce.save();
        } catch (err) {
          console.log(err);
        }
      }

      return res.status(200).json({ message: "La sauce a bien été signalé." }, hateoasLinks(req, sauce._id));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Return an array of all links HATEOAS
function hateoasLinks(req, id) {
  const baseUri = req.protocol + "://" + req.get("host");

  return [
    { rel: "readAll", method: "GET", href: baseUri + "/api/sauces" },
    {
      rel: "create",
      method: "POST",
      title: "Create Sauce",
      href: baseUri + "/api/sauces",
    },
    {
      rel: "readOne",
      method: "GET",
      href: baseUri + "/api/sauces/" + id,
    },
    {
      rel: "update",
      method: "PUT",
      title: "Modify Sauce",
      href: baseUri + "/api/sauces/" + id,
    },
    {
      rel: "delete",
      method: "DELETE",
      title: "Delete Sauce",
      href: baseUri + "/api/sauces/" + id,
    },
    {
      rel: "like",
      method: "POST",
      title: "Like or Dislike Sauce",
      href: baseUri + "/api/sauces/" + id + "/like",
    },
    {
      rel: "report",
      method: "POST",
      title: "Report a Sauce",
      href: baseUri + "/api/sauces/" + id + "/report",
    },
  ];
}