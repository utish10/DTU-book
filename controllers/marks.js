const mongoose = require("mongoose");
const Score = require("../models/marks");
const Course = require("../models/course");
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Student = require("../models/student");
const student = require("../models/student");

module.exports.renderSearchForm = async (req, res, next) => {
  const foundTeacher = await Teacher.findById(req.user.mainId).populate(
    "courses"
  );
  res.render("marks/searchMarks", { foundTeacher });
};

module.exports.scoresListView = async (req, res, next) => {
  const { description, course } = req.body;
  const foundTeacher = await Teacher.findById(req.user.mainId).populate(
    "subject"
  );
  const foundCourse = await Course.findOne({ title: course });
  if (!foundCourse) {
    req.flash("error", "Could not find that course");
    res.redirect("/searchmarks");
  }
  const currentScore = await Score.findOne({
    course: foundCourse._id,
    description: description,
    subject: foundTeacher.subject._id,
  });
  if (currentScore) {
    const foundCourse = await Course.findById(currentScore.course);
    let studentsNames = [];
    const foundSubject = await Subject.findById(currentScore.subject);
    for (let studentId of currentScore.studentIds) {
      const foundStudent = await Student.findById(studentId);
      studentsNames.push(`${foundStudent.firstName} ${foundStudent.lastName}`);
    }
    res.render("marks/listView.ejs", {
      currentScore,
      foundCourse,
      studentsNames,
      foundSubject,
    });
  } else {
    req.flash("error", "No record found");
    res.redirect("/searchmarks");
  }
};

module.exports.searchScore = async (req, res, next) => {
  const { subject, description, studentId } = req.body;
  res.redirect(
    `/scorecard/?subject=${subject}&description=${description}&studentId=${studentId}`
  );
};

module.exports.renderScorecard = async (req, res, next) => {
  const { subject, description, studentId } = req.query;
  console.log(req.query);
  const currentSubject = await Subject.findOne({
    title: subject,
  });
  if (!currentSubject) {
    req.flash("error", "Could not find that subject");
    res.redirect("/searchmarks");
  }
  if (req.user.role == "Student") {
    const foundStudent = await Student.findById(req.user.mainId);
    if (foundStudent) {
      const currentCourse = await Course.findById(foundStudent.course);
      if (!currentCourse) {
        req.flash("error", "Could not find that course");
        res.redirect(`/students/${foundStudent._id}`);
      }
      const currentScore = await Score.findOne({
        course: currentCourse._id,
        description: description,
        subject: currentSubject._id,
      });
      if (!currentScore) {
        req.flash("error", "Could not find any record");
        res.redirect(`/students/${foundStudent._id}`);
      }
      if (currentScore) {
        console.log(foundStudent._id);
        for (let score of currentScore.scoresMap) {
          console.log(score.studentId);
          const student = await Student.findById(score.studentId);
          if (student.emailAddress == foundStudent.emailAddress) {
            const foundCourse = await Course.findById(currentScore.course);
            const foundTeacher = await Teacher.findById(currentScore.teacher);
            const foundSubject = await Subject.findById(currentScore.subject);
            res.render("marks/scorecard", {
              score,
              foundCourse,
              foundTeacher,
              currentScore,
              foundSubject,
              foundStudent,
            });
            // console.log(score);
          }
        }
        // res.render("marks/scorecard", { currentScore });
      } else {
        req.flash("error", "Scorecard not found");
        res.redirect(`/students/${foundStudent._id}`);
      }
    } else {
      req.flash("error", "No such student found in the record");
      res.redirect(`/`);
    }
  } else if (req.user.role == "Teacher") {
    const foundStudent = await Student.findById(studentId).populate("course");
    if (!foundStudent) {
      req.flash("error", "No such student exists");
      res.redirect("/searchmarks");
    }
    const currentTeacher = await Teacher.findById(req.user.mainId);
    if (currentTeacher.courses.indexOf(foundStudent.course._id) != -1) {
      const currentScore = await Score.findOne({
        course: foundStudent.course._id,
        description: description,
        subject: currentSubject._id,
      });
      if (currentScore) {
        for (let score of currentScore.scoresMap) {
          const student = await Student.findById(score.studentId);
          if (foundStudent.emailAddress == student.emailAddress) {
            const foundCourse = await Course.findById(currentScore.course);
            const foundTeacher = await Teacher.findById(currentScore.teacher);
            const foundSubject = await Subject.findById(currentScore.subject);
            res.render("marks/scorecard", {
              score,
              foundCourse,
              foundTeacher,
              currentScore,
              foundSubject,
              foundStudent,
            });
          }
        }
      } else {
        req.flash("error", "No record could be found");
        res.redirect("/searchmarks");
      }
    } else {
      req.flash("error", "Authorisation could not be provided");
      res.redirect("/searchmarks");
    }
  }
};

module.exports.renderSelectCourse = async (req, res, next) => {
  const currentTeacher = await Teacher.findById(req.user.mainId).populate(
    "courses"
  );
  if (currentTeacher.courses.length == 0) {
    req.flash("error", "You have not been alloted any courses");
    res.redirect(`/teachers/${currentTeacher._id}`);
  }
  const currentSubject = await Subject.findById(currentTeacher.subject);
  // console.log(currentTeacher);
  // console.log(currentSubject);
  res.render("marks/selectCourse", { currentSubject, currentTeacher });
};

module.exports.selectCourse = async (req, res, next) => {
  const { course, description, maxMarks } = req.body;
  res.redirect(
    `/newscorecard/?course=${course}&description=${description}&maxMarks=${maxMarks}`
  );
};

module.exports.renderNewScorecardForm = async (req, res, next) => {
  const { course, description, maxMarks } = req.query;
  const foundCourse = await Course.findOne({ title: course }).populate(
    "students"
  );
  if (!foundCourse) {
    req.flash("error", "Could not find that course");
    res.redirect("/selectcourse");
  }
  const currentTeacher = await Teacher.findById(req.user.mainId).populate(
    "courses"
  );
  const currentSubject = await Subject.findById(currentTeacher.subject);
  res.render("marks/newScorecard", {
    foundCourse,
    maxMarks,
    description,
    currentTeacher,
    currentSubject,
  });
};

module.exports.newEntry = async (req, res, next) => {
  const { maxMarks, description, course, scores } = req.body;
  const foundCourse = await Course.findOne({ title: course });
  if (!foundCourse) {
    req.flash("error", "Could not find that course");
    res.redirect("/selectcourse");
  }
  const foundTeacher = await Teacher.findById(req.user.mainId);
  console.log(foundTeacher);
  const foundSubject = await Subject.findById(foundTeacher.subject);
  console.log(foundSubject);
  if (foundCourse && foundTeacher && foundSubject) {
    const studentIds = foundCourse.students;
    if (foundTeacher.courses.indexOf(foundCourse._id) != -1) {
      const newEntry = new Score({
        maxMarks: maxMarks,
        description: description,
        course: foundCourse,
        scores: scores,
        subject: foundSubject,
        teacher: foundTeacher,
        studentIds: studentIds,
        scores: scores,
      });
      let count = 0;
      for (let score of scores) {
        const newScore = {
          studentId: studentIds[count],
          score: scores[count],
        };
        newEntry.scoresMap.push(newScore);
        count++;
      }
      for (let studentId of studentIds) {
        const foundStudent = await Student.findById(studentId);
        foundStudent.marks.push(newEntry);
        await foundStudent.save();
      }
      await newEntry.save();
      console.log(newEntry);
      req.flash("success", "Successfully entered to database");
      res.redirect(`/searchmarks`);
    } else {
      req.flash("error", "Authorisation could not be provided");
      res.redirect("/selectcourse");
    }
  } else {
    req.flash("error", "Some error occured. Try again!");
    res.redirect("/selectcourse");
  }
};

module.exports.renderEditForm = async (req, res, next) => {
  const { description, subject, studentId, entryRecord } = req.query;
  const currentScore = await Score.findById(entryRecord);
  if (!currentScore) {
    req.flash("error", "Could not find any record");
    res.redirect("/searchmarks");
  }
  const maxMarks = currentScore.maxMarks;
  const foundStudent = await Student.findById(studentId);
  if (!foundStudent) {
    req.flash("error", "Requested student could not be found");
    res.redirect("/searchmarks");
  }
  const foundSubject = await Subject.findOne({ title: subject });
  if (!foundSubject) {
    req.flash("error", "That subject does not exist");
    res.redirect("/searchmarks");
  }
  res.render("marks/editForm", {
    foundStudent,
    foundSubject,
    description,
    entryRecord,
    maxMarks,
  });
};

module.exports.editMarks = async (req, res, next) => {
  const { description, subject, studentId, newMarks, entryRecord } = req.body;
  const foundRecord = await Score.findById(entryRecord);
  if (!foundRecord) {
    req.flash("error", "No such record found");
    res.redirect("/searchmarks");
  }
  const maxMarks = foundRecord.maxMarks;
  console.log(maxMarks);
  const foundStudent = await Student.findById(studentId);
  if (!foundStudent) {
    req.flash("Requested student could not be found");
    res.redirect("/searchmarks");
  }
  const foundSubject = await Subject.findOne({ title: subject });
  if (!foundSubject) {
    req.flash("error", "No such subject exists");
    res.redirect("/searchmarks");
  }
  const currentTeacher = await Teacher.findById(req.user.mainId);
  if (currentTeacher.courses.indexOf(foundStudent.course._id) != -1) {
    const currentScore = await Score.findOne({
      course: foundStudent.course._id,
      description: description,
      subject: foundSubject._id,
    });
    if (currentScore) {
      for (let score of currentScore.scoresMap) {
        const student = await Student.findById(score.studentId);
        if (foundStudent.emailAddress == student.emailAddress) {
          if (newMarks < maxMarks) {
            score.score = newMarks;
            await currentScore.save();
            console.log(score);
            req.flash("success", "Marks modified successfully");
            res.redirect(
              `/scorecard/?subject=${foundSubject.title}&description=${description}&studentId=${foundStudent._id}`
            );
          } else {
            req.flash("error", "New marks exceeded maximum marks");
            res.redirect("/searchmarks");
          }
        }
      }
    } else {
      req.flash("error", "No such record exists");
      res.redirect("/searchmarks");
    }
  } else {
    req.flash("error", "Authorisation could not be provided");
    res.redirect("/searchmarks");
  }
};
