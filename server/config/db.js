const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  return mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("connection to database established..........");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = connectDB;
