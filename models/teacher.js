const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: Number,
    required: ["true", "Phone Number cannot be left blank"],
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    required: ["true", "Gender cannot be left blank"],
  },
  dateOfBirth: {
    type: Date,
    required: ["true", "Date of Birth cannot be left blank"],
  },
  residence: {
    type: String,
    required: ["true", "Resdence cannot be left blank"],
  },
  designation: {
    type: String,
    enum: [
      "Professor",
      "Assistant Professor",
      "Associate Professor",
      "Instructor",
    ],
    required: ["true", "Designation cannot be left blank"],
  },
  pastExperience: {
    type: String,
  },
  photograph: {
    url: {
      type: String,
    },
    filename: {
      type: String,
    },
    required: ["true", "Photograph cannot be left blank"],
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: ["true", "Subject cannot be left blank"],
  },
});

const teacher = mongoose.model("Teacher", teacherSchema);
module.exports = teacher;
