const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = db.user;

// Create new User
exports.signup = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Encrypt the password send in request
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Define the User object with datas in request and the hashed password
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Save the user and return a response
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Votre compte a bien été créé." }, [
            {
              rel: "create",
              method: "POST",
              title: "Create User",
              href: baseUri + "/api/auth/signup",
            },
            {
              rel: "login",
              method: "POST",
              title: "Login User",
              href: baseUri + "/api/auth/login",
            },
          ])
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Login User
exports.login = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Find user with email send in request
  User.findOne({ email: req.body.email })
    .then((user) => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Votre compte utilisateur n'as pas pu être trouvé." });
      }

      // Check if the password in DB is equal to the password in request
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // If password is invalid, return an error
          if (!valid) {
            return res
              .status(401)
              .json({ error: "Le mot de passe indiqué est incorrecte." });
          }

          // If all is fine, return the userId and Auth token
          res.status(200).json(
            {
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                "sbcL5tx568Wnntebf8wZn1mlctd6wIw9",
                { expiresIn: "24h" }
              ),
            },
            [
              {
                rel: "create",
                method: "POST",
                title: "Create User",
                href: baseUri + "/api/auth/signup",
              },
              {
                rel: "login",
                method: "POST",
                title: "Login User",
                href: baseUri + "/api/auth/login",
              },
            ]
          );
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Delete a User with the specified id in the request
// exports.delete = (req, res) => {
//   User.findOneAndDelete(req.body.userId).then(result => {
//     if (!result) {
//         return res.status(401).json({ error: 'Votre compte utilisateur n\'as pas pu être trouvé.' });
//     }
//   }).catch(error => res.status(500).json({ error }));
// };
