const mongoose = require("mongoose");
const bunyan = require("bunyan");
const log = Logger.createLogger({
  name: "MongoDB Driver",
  streams: [
    {
      stream: process.stdout,
      level: "info",
    },
    {
      stream: process.stdout,
      level: "debug",
    },
    {
      stream: process.stderr,
      level: "error",
    },
    {
      type: "rotating-file",
      path: "/var/log/mongodb-sopekocko.log",
      period: "1d", // daily rotation
      count: 3, // keep 3 back copies
    },
  ],
});
require("dotenv").config();

if (!process.env.DB_URL) {
  console.log("No DB_URL found in .env configuration");
}

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

module.exports = mongoose.connection;
