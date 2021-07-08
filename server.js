const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require("cors");

const userCtrl = require("./app/controllers/user.controller");
const sauceCtrl = require("./app/controllers/sauce.controller");
const imageCtrl = require("./app/controllers/image.controller");

const auth = require("./app/middleware/auth");

const app = express();

var corsOptions = {
  origin: "http://localhost:4200"
};

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Connect databse
const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });



/** 
 * Routes
 **/
app.get("/", (req, res) => {
  res.json({ message: "Welcome to So Pekocko application." });
});
// Auth
app.post("/api/auth/signup", userCtrl.signup);
app.post("/api/auth/login", userCtrl.login);
// Image
app.get("/api/image/:image", imageCtrl.get);
// Sauces
app.get("/api/sauces", auth, sauceCtrl.list);
app.get("/api/sauces/:id", auth, sauceCtrl.get);
app.post("/api/sauces", auth, sauceCtrl.add);
app.post("/api/sauces/:id/like", auth, sauceCtrl.like);
app.put("/api/sauces/:id", auth, sauceCtrl.update);
app.delete("/api/sauces/:id", auth, sauceCtrl.delete);



// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});