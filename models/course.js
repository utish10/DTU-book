const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: ["true", "Course title cannot be left blank"],
  },
  year: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: ["true", "Course year cannot be left blank"],
  },
  semester: {
    type: String,
    enum: ["Odd", "Even"],
    required: ["true", "Course semester cannot be left blank"],
  },
  duration: {
    type: Number,
    required: ["true", "Course duration cannot be left blank"],
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

const course = mongoose.model("Course", courseSchema);
module.exports = course;
