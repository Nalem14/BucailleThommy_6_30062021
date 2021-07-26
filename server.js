const express = require("express");
const fileUpload = require("express-fileupload");
const hateoasLinker = require("express-hateoas-links");
const cors = require("cors");
const helmet = require('helmet');
const routes = require("./app/routes");
const tooBusyMiddleware = require("./app/middleware/tooBusy.middleware");
const hpp = require('hpp');
const app = express();

require('dotenv').config();

/**
 * Settings
 **/

var corsOptions = {
  origin: "http://localhost:4200",
};

app.use(tooBusyMiddleware);

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true,
    abortOnLimit: true,
    responseOnLimit: "Taille limite pour l'envoi d'un fichier atteinte",
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: '1mb' },
  })
);

// Enable helmet
app.use(helmet());
app.disable('x-powered-by');

// replace standard express res.json with the new version
app.use(hateoasLinker);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Protect HTTP Parameters Pollution
app.use(hpp());

// Serve public folder
app.use(express.static(__dirname + "/public"));

// Define routes
app.use(routes);


// Connect databse
const db = require("./config/db.config");


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
