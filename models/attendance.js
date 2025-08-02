const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  date: {
    type: Date,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  attendanceMap: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      attendance: {
        type: String,
      },
    },
  ],
});

const attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = attendance;
