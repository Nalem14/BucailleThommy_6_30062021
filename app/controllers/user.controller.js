const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const User = require("../models/user.model")(mongoose);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { passwordStrength } = require('check-password-strength');
const bouncer = require('express-bouncer')(5000, 900000, 3);
const { pwnedPassword } = require('hibp');
var CryptoJS = require("crypto-js");

// Validate email string
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Create new User
exports.signup = async (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Check password strength
  if(passwordStrength(req.body.password).value != "Medium" && passwordStrength(req.body.password).value != "Strong") {
    return res.status(400).json({ error: "Le mot de passe indiqué n'est pas suffisamment sécurisé." })
  }

  // Check email validation
  if(!validateEmail(req.body.email)) {
    return res.status(400).json({ error: "L'email indiqué est invalide." })
  }

  // Check pwned password
  let nbPwned = await pwnedPassword(req.body.password);
  if(nbPwned > 0) {
    return res.status(400).json({ error: "Ce mot de passe n'est pas sécurisé." });
  }

  // Encrypt the password send in request
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Encrypt email
      var emailEncrypted = encryptEmail(req.body.email);

      // Define the User object with datas in request and the hashed password
      const user = new User({
        email: emailEncrypted,
        password: hash,
      });

      // Save the user and return a response
      user
        .save()
        .then(() => {
          bouncer.reset(req);
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
            {
              rel: "getDatas",
              method: "GET",
              title: "Get User datas",
              href: baseUri + "/api/auth/get-datas",
            },
            {
              rel: "exportDatas",
              method: "GET",
              title: "Export User datas",
              href: baseUri + "/api/auth/export-datas",
            },
            {
              rel: "alert",
              method: "POST",
              title: "Alert a User",
              href: baseUri + "/api/auth/alert",
            },
            {
              rel: "update",
              method: "PUT",
              title: "Update User",
              href: baseUri + "/api/auth/update",
            },
            {
              rel: "delete",
              method: "DELETE",
              title: "Delete User",
              href: baseUri + "/api/auth/delete",
            }
          ]);
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Login User
exports.login = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Encrypt email
  var emailEncrypted = encryptEmail(req.body.email);

  // Find user with email send in request
  User.findOne({ email: emailEncrypted })
    .then((user) => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Les identifiants fournis ne correspondent pas." });
      }

      // Check if the password in DB is equal to the password in request
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // If password is invalid, return an error
          if (!valid) {
            return res
              .status(401)
              .json({ error: "Les identifiants fournis ne correspondent pas." });
          }

          // If all is fine, return the userId and Auth token
          bouncer.reset(req);
          res.status(200).json(
            {
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                process.env.SECRET,
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
              {
                rel: "getDatas",
                method: "GET",
                title: "Get User datas",
                href: baseUri + "/api/auth/get-datas",
              },
              {
                rel: "exportDatas",
                method: "GET",
                title: "Export User datas",
                href: baseUri + "/api/auth/export-datas",
              },
              {
                rel: "alert",
                method: "POST",
                title: "Alert a User",
                href: baseUri + "/api/auth/alert",
              },
              {
                rel: "update",
                method: "PUT",
                title: "Update User",
                href: baseUri + "/api/auth/update",
              },
              {
                rel: "delete",
                method: "DELETE",
                title: "Delete User",
                href: baseUri + "/api/auth/delete",
              }
            ]
          );
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getDatas = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  User.findOne({ _id: req.userId})
    .then(user => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
      }

      // Decrypt email
      user.email = decryptEmail(user.email);

      return res.status(200).json(user,
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
          {
            rel: "getDatas",
            method: "GET",
            title: "Get User datas",
            href: baseUri + "/api/auth/get-datas",
          },
          {
            rel: "exportDatas",
            method: "GET",
            title: "Export User datas",
            href: baseUri + "/api/auth/export-datas",
          },
          {
            rel: "alert",
            method: "POST",
            title: "Alert a User",
            href: baseUri + "/api/auth/alert",
          },
          {
            rel: "update",
            method: "PUT",
            title: "Update User",
            href: baseUri + "/api/auth/update",
          },
          {
            rel: "delete",
            method: "DELETE",
            title: "Delete User",
            href: baseUri + "/api/auth/delete",
          }
        ]);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error })
    });
};

exports.exportDatas = (req, res) => {
  User.findOne({ _id: req.userId})
    .then(user => {
      // If user not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
      }

      // Decrypt email
      user.email = decryptEmail(user.email);

      var text = user.toString();
      res.attachment('user-datas.txt');
      res.type('txt');
      return res.status(200).send(text);
    })
    .catch((error) => res.status(500).json({ error }));
};

// Alert a user
exports.alert = async (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  let userId = req.body.userId;
  // Get current user in session
  let currentUser = await User.findOne({ _id: req.userId});

  // If current user not found, return an error
  if(!currentUser) {
    return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
  }

  // User to alert
  User.findOne({ _id: userId})
    .then(user => {
      // If user to alert not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
      }

      if(user.usersAlert.indexOf(currentUser._id) === -1) {
        user.usersAlert.push(currentUser._id);
        user.save();
      }

      return res.status(200).json({ message: "L'utilisateur a bien été signalé." },
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
        {
          rel: "getDatas",
          method: "GET",
          title: "Get User datas",
          href: baseUri + "/api/auth/get-datas",
        },
        {
          rel: "exportDatas",
          method: "GET",
          title: "Export User datas",
          href: baseUri + "/api/auth/export-datas",
        },
        {
          rel: "alert",
          method: "POST",
          title: "Alert a User",
          href: baseUri + "/api/auth/alert",
        },
        {
          rel: "update",
          method: "PUT",
          title: "Update User",
          href: baseUri + "/api/auth/update",
        },
        {
          rel: "delete",
          method: "DELETE",
          title: "Delete User",
          href: baseUri + "/api/auth/delete",
        }
      ]);

    }).catch(error => res.status(500).json({ error }));
};

// Update user account
exports.update = async (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  // Find user in the current session
  let user = await User.findOne({ _id: req.userId });
  // If user not found, return an error
  if(!user) {
    return res
          .status(401)
          .json({ error: "Utilisateur introuvable." });
  }

  /**
   * If user change password
   **/
  if("password" in req.body) {
    // Check password strength
    if(passwordStrength(req.body.password).value != "Medium" && passwordStrength(req.body.password).value != "Strong") {
      return res.status(400).json({ error: "Le mot de passe indiqué n'est pas suffisamment sécurisé." })
    }

    // Check pwned password
    let nbPwned = await pwnedPassword(req.body.password);
    if(nbPwned > 0) {
      return res.status(400).json({ error: "Ce mot de passe n'est pas sécurisé." });
    }

    // Encrypt the password send in request and save in the User object
    const hash = await bcrypt.hash(req.body.password, 10)
    user.password = hash;
  }

  /**
   * If user change email
   **/
  if("email" in req.body) {
    // Check email validation
    if(!validateEmail(req.body.email)) {
      return res.status(400).json({ error: "L'email indiqué est invalide." })
    }

    // Encrypt email
    var emailEncrypted = encryptEmail(req.body.email);


    // Save the email in the User object
    user.email = emailEncrypted;
  }

  // Save the user and return a response
  user
  .save()
  .then(() => {
    res.status(201).json({ message: "Votre compte a bien été modifié." },
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
      {
        rel: "getDatas",
        method: "GET",
        title: "Get User datas",
        href: baseUri + "/api/auth/get-datas",
      },
      {
        rel: "exportDatas",
        method: "GET",
        title: "Export User datas",
        href: baseUri + "/api/auth/export-datas",
      },
      {
        rel: "alert",
        method: "POST",
        title: "Alert a User",
        href: baseUri + "/api/auth/alert",
      },
      {
        rel: "update",
        method: "PUT",
        title: "Update User",
        href: baseUri + "/api/auth/update",
      },
      {
        rel: "delete",
        method: "DELETE",
        title: "Delete User",
        href: baseUri + "/api/auth/delete",
      }
    ]);
  })
  .catch((error) => res.status(400).json({ error }));
};

// Delete User account
exports.delete = (req, res) => {
  const baseUri = req.protocol + "://" + req.get("host");

  User.findOneAndDelete(req.userId).then(result => {
    if (!result) {
        return res.status(401).json({ error: 'Votre compte utilisateur n\'as pas pu être trouvé.' });
    }

    return res.status(200).json({ message: "Votre compte utilisateur a bien été supprimé."},
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
      {
        rel: "getDatas",
        method: "GET",
        title: "Get User datas",
        href: baseUri + "/api/auth/get-datas",
      },
      {
        rel: "exportDatas",
        method: "GET",
        title: "Export User datas",
        href: baseUri + "/api/auth/export-datas",
      },
      {
        rel: "alert",
        method: "POST",
        title: "Alert a User",
        href: baseUri + "/api/auth/alert",
      },
      {
        rel: "update",
        method: "PUT",
        title: "Update User",
        href: baseUri + "/api/auth/update",
      },
      {
        rel: "delete",
        method: "DELETE",
        title: "Delete User",
        href: baseUri + "/api/auth/delete",
      }
    ]);
  }).catch(error => res.status(500).json({ error }));
};

function encryptEmail(email) {
  return CryptoJS.AES.encrypt(email, CryptoJS.enc.Base64.parse(process.env.PASSPHRASE), { iv: CryptoJS.enc.Base64.parse(process.env.IV), mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }).toString();
}

function decryptEmail(email) {
  var bytes  = CryptoJS.AES.decrypt(email, CryptoJS.enc.Base64.parse(process.env.PASSPHRASE), { iv: CryptoJS.enc.Base64.parse(process.env.IV), mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return bytes.toString(CryptoJS.enc.Utf8);
}