const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  description: {
    type: String,
    enum: ["Mid-Sem", "End-Sem"],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  scoresMap: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      score: {
        type: Number,
        min: 0,
      },
    },
  ],
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  scores: [
    {
      type: Number,
    },
  ],
});

const scores = mongoose.model("Score", marksSchema);
module.exports = scores;
