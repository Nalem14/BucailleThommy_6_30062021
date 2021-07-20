const FileType = require('file-type');

module.exports = async (req, res, next) => {
  try {
    // Check if request contain files uploaded
    if (!req.files || !req.files.image) {
        return next();
    }

    // Get image file
    let image = req.files.image;

    // Check file type
    let fileType = await FileType.fromFile(image.tempFilePath);
    let mimetype = fileType.mime;

    // Check file extension
    if(mimetype != "image/png" && mimetype != "image/jpg" && mimetype != "image/jpeg" && mimetype != "image/gif") {
        throw "Merci d'envoyer une image valide (format JPG/JPEG, GIF ou PNG)";
    }

    // Get current timestamp
    let timestamp = Math.floor(Date.now() / 1000);
    // Define image name
    image.name = timestamp + "." + fileType.ext;
    next();

  } catch(err) {
    res.status(401).json({
      error: err
    });
  }
};