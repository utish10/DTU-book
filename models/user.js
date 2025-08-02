const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  emailAddress: {
    type: String,
    required: ["true", "Email Address cannot be left blank"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    required: ["true", "Role cannot be left blank"],
  },
  mainId: {
    type: mongoose.Schema.Types.ObjectId,
    required: ["true", "Role cannot be left blank"],
  },
});
userSchema.plugin(passportLocalMongoose);

const user = mongoose.model("User", userSchema);
module.exports = user;
