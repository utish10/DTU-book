const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: ["true", "First Name cannot be left blank"],
    maxlength: 25,
    minlength: 2,
  },
  lastName: {
    type: String,
    maxlength: 25,
    minlength: 2,
  },
  emailAddress: {
    type: String,
    required: ["true", "Email Address cannot be left blank"],
    unique: true,
  },
});

const admin = mongoose.model("Admin", adminSchema);
module.exports = admin;
