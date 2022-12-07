const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to the database");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// module.exports = connectDB;
