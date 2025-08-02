const Student = require("../models/student");
const Course = require("../models/course");
const Attendance = require("../models/attendance");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Score = require("../models/marks");
const { cloudinary } = require("../cloudinary");
const student = require("../models/student");
const Joi = require("joi");
const ExpressError = require("../utilities/ExpressError");

module.exports.renderNewForm = async (req, res) => {
  const coursesList = await Course.find();
  let coursesTitles = [];
  for (let course of coursesList) {
    coursesTitles.push(course.title);
  }
  res.render("students/new", { coursesTitles });
};

module.exports.allStudents = async (req, res) => {
  let filters = {};
  if (req.query.phoneNumber) {
    filters.phoneNumber = req.query.phoneNumber;
  }
  if (req.query.emailAddress.length) {
    filters.emailAddress = req.query.emailAddress;
  }
  if (req.query.firstName.length) {
    filters.firstName = req.query.firstName;
  }
  if (req.query.lastName.length) {
    filters.lastName = req.query.lastName;
  }
  if (req.query.course.length) {
    const foundCourse = await Course.findOne({ title: req.query.course });
    filters.course = foundCourse._id;
    console.log(foundCourse);
  }
  console.log(filters);
  const studentsList = await Student.find(filters).populate("course");
  res.render("students/index", { studentsList });
};

module.exports.renderSearchForm = async (req, res) => {
  const coursesList = await Course.find();
  res.render("students/search", { coursesList });
};

module.exports.searchStudent = async (req, res) => {
  const { phoneNumber, emailAddress, firstName, lastName, course } = req.body;
  res.redirect(
    `/students/?phoneNumber=${phoneNumber}&emailAddress=${emailAddress}&firstName=${firstName}&lastName=${lastName}&course=${course}`
  );
};

module.exports.newStudent = async (req, res) => {
  const {
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    gender,
    dateOfBirth,
    residence,
    classTenthSchool,
    classTenthBoard,
    classTenthScore,
    classTenthYear,
    classTwelfthSchool,
    classTwelfthBoard,
    classTwelfthScore,
    classTwelfthYear,
    course,
  } = req.body;
  const newStudent = new Student({
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    phoneNumber: phoneNumber,
    gender: gender,
    dateOfBirth: dateOfBirth,
    residence: residence,
    classTenthSchool: classTenthSchool,
    classTenthBoard: classTenthBoard,
    classTenthScore: classTenthScore,
    classTenthYear: classTenthYear,
    classTwelfthSchool: classTwelfthSchool,
    classTwelfthBoard: classTwelfthBoard,
    classTwelfthScore: classTwelfthScore,
    classTwelfthYear: classTwelfthYear,
  });
  console.log(req.body);
  const foundCourse = await Course.findOne({ title: course });
  newStudent.photograph.url = req.file.path.replace(
    "upload/",
    `upload/w_200,c_scale/`
  );
  newStudent.photograph.filename = req.file.filename;
  if (!foundCourse) {
    console.log("Course not found");
  }
  foundCourse.students.push(newStudent);
  await foundCourse.save();
  newStudent.course = foundCourse;
  for (let subjectId of foundCourse.subjects) {
    const foundSubject = await Subject.findById(subjectId);
    const newElement = {
      subjectName: foundSubject.title,
      subjectId: subjectId,
      attendanceRecord: {
        totalDays: 0,
        daysPresent: 0,
      },
    };
    newStudent.currentSemesterAttendance.push(newElement);
  }
  await newStudent.save();
  req.flash("success", "Successfully added a new student");
  res.redirect(
    `/register/?emailAddress=${newStudent.emailAddress}&username=${newStudent.phoneNumber}&role=Student&studentId=${newStudent.studentId}`
  );
};

module.exports.showStudent = async (req, res) => {
  const { id } = req.params;
  const foundStudent = await Student.findById(id).populate("course");
  if (!foundStudent) {
    req.flash("error", "Requested student could not be found");
    res.redirect("/studentsearch");
  }
  const subjectTitles = [];
  for (let subject of foundStudent.course.subjects) {
    const foundSubject = await Subject.findById(subject);
    subjectTitles.push(foundSubject.title);
  }
  if (req.user.role == "Teacher") {
    console.log(foundStudent);
    const foundTeacher = await Teacher.findById(req.user.mainId).populate(
      "subject"
    );
    res.render("students/show", { foundStudent, subjectTitles, foundTeacher });
  } else {
    console.log(foundStudent);
    res.render("students/show", { foundStudent, subjectTitles });
  }
};

module.exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  const foundStudent = await Student.findById(id);
  if (!foundStudent) {
    req.flash("error", "Requested student could not be found");
    res.redirect("/studentsearch");
  } else {
    if (foundStudent.photograph) {
      await cloudinary.uploader.destroy(foundStudent.photograph.filename);
    }
    const updatedCourse = await Course.findByIdAndUpdate(foundStudent.course, {
      $pull: { students: foundStudent._id },
    });
    const deletedStudent = await Student.findByIdAndDelete(id);
    req.flash("success", "Student successfully deleted from the database");
    res.redirect("/studentsearch");
    console.log(deletedStudent);
  }
};

module.exports.editStudent = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    gender,
    dateOfBirth,
    residence,
    course,
  } = req.body;
  console.log(req.body);
  const foundStudent = await Student.findById(id);
  if (!foundStudent) {
    req.flash("error", "Requested student could not be found");
  } else {
    let updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        gender: gender,
        dateOfBirth: dateOfBirth,
        residence: residence,
      },
      { new: true }
    );
    const foundCourse = await Course.findOne({ title: course });
    console.log("FoundCourse ", foundCourse);
    if (!foundCourse) {
      console.log("Course could not be found");
    } else {
      const oldCourse = await Course.findByIdAndUpdate(foundStudent.course, {
        $pull: { students: id },
      });
      if (!oldCourse) {
        console.log("Student is not enrolled in any course");
      }
      updatedStudent = await Student.findByIdAndUpdate(id, {
        course: foundCourse,
      });
      foundCourse.students.push(foundStudent);
      await foundCourse.save();
    }
    req.flash("success", "Student successfully modified");
    res.redirect(`/students/${foundStudent._id}`);
  }
};

module.exports.showAttendance = async (req, res) => {
  const { studentId, subjectId, courseId } = req.params;
  let authorizationCode = 0;
  if (req.user.role == "Teacher") {
    const foundTeacher = await Teacher.findById(req.user.mainId);
    if (foundTeacher.subject == subjectId) {
      authorizationCode = 1;
    }
  }
  if (req.user.role == "Student") {
    if (req.user.mainId == studentId) {
      authorizationCode = 1;
    }
  }
  if (req.user.role == "Admin") {
    authorizationCode = 1;
  }
  if (authorizationCode == 1) {
    const presentDays = await Attendance.find({
      students: { $in: [studentId] },
      subject: subjectId,
      course: courseId,
    });
    let daysPresent = 0;
    for (let day of presentDays) {
      daysPresent++;
      console.log(day.date);
    }
    const totalDays = await Attendance.countDocuments({
      subject: subjectId,
      course: courseId,
    });
    console.log(totalDays);
    console.log(daysPresent);
  } else {
    req.flash("error", "Requested record could not be found");
    res.redirect("/");
  }
};

module.exports.showMarks = async (req, res, next) => {
  const { studentId, subjectId, courseId, description } = req.body;
  let authorizationCode = 0;
  if (req.user.role == "Student") {
    if (req.user.mainId == studentId) {
      authorizationCode = 1;
    }
  }
  if (req.user.role == "Teacher") {
    const currentTeacher = await Teacher.findById(req.user.mainId);
    if (
      currentTeacher.subject == subjectId &&
      currentTeacher.courses.indexOf(courseId) != -1
    ) {
      authorizationCode = 1;
    }
  }
  if (authorizationCode == 1) {
    const foundRecords = await Score.find({
      studentIds: { $in: [studentId] },
      subject: subjectId,
      course: courseId,
      description: description,
    });
    if (foundRecords.length > 1) {
      console.log("Duplicate records for the same description exist");
    } else {
      const foundRecord = await Score.findOne({
        studentIds: { $in: [studentId] },
        subject: subjectId,
        course: courseId,
        description: description,
      });
      const studentsArray = foundRecord.studentIds;
      const index = studentsArray.indexOf(studentId);
      const finalScore = foundRecord.scores[index];
      console.log(finalScore);
    }
  } else {
    console.log("Authorization could not be provided");
  }
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const foundStudent = await Student.findById(id);
  if (!foundStudent) {
    req.flash("error", "Requested student not found");
    res.redirect("/studentsearch");
  } else {
    const coursesList = await Course.find();
    let courseTitles = [];
    for (let course of coursesList) {
      courseTitles.push(course.title);
    }
    res.render("students/edit", { foundStudent, courseTitles });
  }
};
