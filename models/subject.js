const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: ["true", "Subject title cannot be left blank"],
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const subject = mongoose.model("Subject", subjectSchema);
module.exports = subject;
