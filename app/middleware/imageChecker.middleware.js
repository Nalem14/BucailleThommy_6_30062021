
module.exports = (req, res, next) => {
  try {
    // Check if request contain files uploaded
    if (!req.files) {
        return next();
    }

    // Get image file
    let image = req.files.image;

    // Check file extension
    if(image.mimetype != "image/png" && image.mimetype != "image/jpg" && image.mimetype != "image/jpeg" && image.mimetype != "image/gif") {
        throw "Merci d'envoyer une image valide (format JPG/JPEG, GIF ou PNG)";
    }

    // Get current timestamp
    let timestamp = Math.floor(Date.now() / 1000);
    // Define image name
    image.name = timestamp + image.name;

    next();

  } catch(err) {
    res.status(401).json({
      error: err
    });
  }
};