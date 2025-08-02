const { kMaxLength } = require("buffer");
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
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
    maxlength: 10,
    minlength: 10,
    min: 0,
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
    required: ["true", "Residence cannot be left blank"],
  },
  classTenthSchool: {
    type: String,
    required: ["true", "Class 10th School cannot be left blank"],
  },
  classTenthBoard: {
    type: String,
    enum: [
      "CBSE",
      "ISC",
      "ICSE",
      "NIOS",
      "UP Board",
      "JKBOSE",
      "RBSE",
      "HPBOSE",
      "MPBOSE",
      "CGBSE",
      "PSEB",
      "BSEH",
      "BSEB",
      "GSEB",
      "MSBSHSE",
      "BIEAP",
      "BSEAP",
      "WBBSE",
      "WBCHSE",
    ],
    required: ["true", "Class 10th Board cannot be left blank"],
  },
  classTenthScore: {
    type: Number,
    max: 100,
    min: 0,
    required: ["true", "Class 10th Score cannot be left blank"],
  },
  classTenthYear: {
    type: Number,
    required: ["true", "Class 10th Year cannot be left blank"],
    min: 2010,
    max: 2022,
  },
  classTwelfthSchool: {
    type: String,
    required: ["true", "Class 12th School cannot be left blank"],
  },
  classTwelfthBoard: {
    type: String,
    enum: [
      "CBSE",
      "ISC",
      "ICSE",
      "NIOS",
      "UP Board",
      "JKBOSE",
      "RBSE",
      "HPBOSE",
      "MPBOSE",
      "CGBSE",
      "PSEB",
      "BSEH",
      "BSEB",
      "GSEB",
      "MSBSHSE",
      "BIEAP",
      "BSEAP",
      "WBBSE",
      "WBCHSE",
    ],
    required: ["true", "Class 12th Board cannot be left blank"],
  },
  classTwelfthScore: {
    type: Number,
    max: 100,
    min: 0,
    required: ["Class 12th Score cannot be blank"],
  },
  classTwelfthYear: {
    type: Number,
    required: ["true", "Class 12th Year cannot be left blank"],
    min: 2010,
    max: 2022,
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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  marks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Score",
    },
  ],
  currentSemesterAttendance: [
    {
      subjectName: {
        type: String,
      },
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      attendanceRecord: {
        totalDays: {
          type: Number,
        },
        daysPresent: {
          type: Number,
        },
      },
    },
  ],
});

const student = mongoose.model("Student", studentSchema);
module.exports = student;
