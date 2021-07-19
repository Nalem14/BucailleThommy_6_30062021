const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.DB_URL) {
    console.log("No DB_URL found in .env configuration");
}

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)
  .catch((error) => {
      console.log("Database connection error: " + error);
  });

module.exports = mongoose.connection;