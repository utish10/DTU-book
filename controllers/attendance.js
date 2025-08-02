const mongoose = require("mongoose");
const Attendance = require("../models/attendance");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Course = require("../models/course");
const Subject = require("../models/subject");
const { renderNewScorecardForm } = require("./marks");

module.exports.renderSelectCourse = async (req, res, next) => {
  const currentTeacher = await Teacher.findById(req.user.mainId).populate(
    "courses"
  );
  const currentSubject = await Subject.findById(currentTeacher.subject);
  res.render("attendance/selectCourse", { currentSubject, currentTeacher });
};

module.exports.newRecord = async (req, res) => {
  const { attendance, course, date } = req.body;
  const foundCourse = await Course.findOne({ title: course });
  if (!foundCourse) {
    req.flash("error", "Incorrect course name entered");
    res.redirect("/attendance/newrecord");
  }
  const foundTeacher = await Teacher.findById(req.user.mainId);
  const foundSubject = await Subject.findById(foundTeacher.subject);
  const newRecord = new Attendance({
    teacher: foundTeacher,
    subject: foundSubject,
    date: date,
    course: foundCourse,
  });
  let count = 0;
  for (let value of attendance) {
    const foundStudent = await Student.findById(
      foundCourse.students[count]._id
    );
    if (!foundStudent) {
      req.flash("error", "Student could not found");
      res.redirect("/studentsearch");
    }
    const newElement = {
      studentId: foundCourse.students[count]._id,
      attendance: value,
    };
    if (newElement.attendance == "A") {
      newRecord.attendanceMap.push(newElement);
      foundStudent.currentSemesterAttendance.forEach(async function (subject) {
        const currentSubject = await Subject.findById(subject.subjectId);
        if (foundSubject.title == currentSubject.title) {
          const subjectIndex = foundStudent.currentSemesterAttendance.findIndex(
            (obj) => obj.subjectName == currentSubject.title
          );
          console.log(subjectIndex);
          foundStudent.currentSemesterAttendance[
            subjectIndex
          ].attendanceRecord.totalDays += 1;
          await foundStudent.save();
        }
        // console.log(subject.subjectId);
      });
    } else {
      foundStudent.currentSemesterAttendance.forEach(async function (subject) {
        const currentSubject = await Subject.findById(subject.subjectId);
        if (foundSubject.title == currentSubject.title) {
          const subjectIndex = foundStudent.currentSemesterAttendance.findIndex(
            (obj) => obj.subjectName == currentSubject.title
          );
          foundStudent.currentSemesterAttendance[
            subjectIndex
          ].attendanceRecord.totalDays += 1;
          foundStudent.currentSemesterAttendance[
            subjectIndex
          ].attendanceRecord.daysPresent += 1;
          await foundStudent.save();
        }
        // console.log(subject.subjectId);
      });
    }
    count++;
  }

  await newRecord.save();
  req.flash("success", "Attendance record successfully created");
  res.redirect(`/attendance/${newRecord._id}`);
  console.log(newRecord);
  // console.log(foundTeacher);
  // console.log(attendance);
};

module.exports.selectCourse = async (req, res, next) => {
  const { course, date } = req.body;
  res.redirect(`/attendance/newrecord/?course=${course}&date=${date}`);
};

module.exports.renderNewAttendanceForm = async (req, res, next) => {
  const { course, date } = req.query;
  const foundCourse = await Course.findOne({ title: course }).populate(
    "students"
  );
  if (!foundCourse) {
    req.flash("error", "Requested course could not be found");
    res.redirect("/attendance/selectcourse");
  }
  const currentTeacher = await Teacher.findById(req.user.mainId).populate(
    "courses"
  );

  const currentSubject = await Subject.findById(currentTeacher.subject);
  res.render("attendance/newAttendanceCard", {
    foundCourse,
    date,
    currentTeacher,
    currentSubject,
  });
};

module.exports.renderAttendanceCard = async (req, res, next) => {
  const { id } = req.params;
  const foundRecord = await Attendance.findById(id)
    .populate("teacher")
    .populate("subject")
    .populate("course")
    .populate({
      path: "attendanceMap",
      populate: {
        path: "studentId",
      },
    });
  if (!foundRecord) {
    req.flash("error", "No record found");
    res.redirect("/attendance/selectcourse");
  } else {
    res.render("attendance/attendanceCard", { foundRecord });
  }
};

module.exports.renderSearchForm = async (req, res, next) => {
  const foundTeacher = await Teacher.findById(req.user.mainId)
    .populate("subject")
    .populate("courses");
  if (foundTeacher.courses.length == 0) {
    req.flash("error", "You have not been alloted any courses");
    res.redirect(`/teachers/${foundTeacher._id}`);
  }
  res.render("attendance/searchForm", { foundTeacher });
};

module.exports.searchAttendance = async (req, res, next) => {
  const { date, course, subject } = req.body;
  const currentTeacher = await Teacher.findById(req.user.mainId).populate(
    "subject"
  );
  const foundCourse = await Course.findOne({ title: course });
  if (!foundCourse) {
    req.flash("error", "Could not find that course");
    res.redirect("/attendance/search");
  }
  const foundSubject = await Subject.findOne({
    title: currentTeacher.subject.title,
  });
  const foundRecord = await Attendance.findOne({
    date: date,
    course: foundCourse._id,
    subject: foundSubject._id,
    teacher: currentTeacher._id,
  });
  if (currentTeacher.courses.indexOf(foundCourse._id) == -1) {
    req.flash("error", "Authorisation could not be provided");
    res.redirect(`/teachers/${currentTeacher._id}`);
  } else if (!foundRecord) {
    req.flash("error", "No record found");
    res.redirect("/attendance/search");
  } else {
    res.redirect(`/attendance/${foundRecord._id}`);
  }
};

module.exports.deleteRecord = async (req, res, next) => {
  const { id } = req.params;
  const currentTeacher = await Teacher.findById(req.user.mainId);
  const foundRecord = await Attendance.findOne({
    id: id,
    teacher: currentTeacher._id,
  }).populate("course");
  if (currentTeacher.courses.indexOf(foundRecord.course._id) == -1) {
    req.flash("error", "Authorisation could not be provided");
    res.redirect(`/teachers/${currentTeacher._id}`);
  } else if (!foundRecord) {
    req.flash("error", "No record found");
    res.redirect("/attendance/search");
  } else {
    const deletedRecord = await Attendance.findByIdAndDelete(id);
    req.flash("success", "Record successfully deleted");
    res.redirect("/attendance/search");
  }
};
