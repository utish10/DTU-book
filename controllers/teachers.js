const mongoose = require("mongoose");
const Teacher = require("../models/teacher");
const Course = require("../models/course");
const Subject = require("../models/subject");
const course = require("../models/course");
const { cloudinary } = require("../cloudinary");

module.exports.renderSearchForm = async (req, res) => {
  const subjects = await Subject.find();
  res.render("teachers/search", { subjects });
};

module.exports.teacherSearch = async (req, res) => {
  const { phoneNumber, emailAddress, firstName, lastName, subject } = req.body;
  res.redirect(
    `/teachers/?phoneNumber=${phoneNumber}&emailAddress=${emailAddress}&firstName=${firstName}&lastName=${lastName}&subject=${subject}`
  );
};

module.exports.allTeachers = async (req, res) => {
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
  if (req.query.subject.length) {
    const foundSubject = await Subject.findOne({ title: req.query.subject });
    filters.subject = foundSubject._id;
  }
  console.log(filters);
  const teachersList = await Teacher.find(filters).populate("subject");
  res.render("teachers/index", { teachersList });
};

module.exports.renderNewForm = async (req, res) => {
  const subjectsList = await Subject.find();
  let subjectTitles = [];
  for (let subject of subjectsList) {
    subjectTitles.push(subject.title);
  }
  const coursesList = await Course.find();
  let courseTitles = [];
  for (let course of coursesList) {
    courseTitles.push(course.title);
  }
  res.render("teachers/new", { courseTitles, subjectTitles });
};

module.exports.newTeacher = async (req, res) => {
  const {
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    gender,
    dateOfBirth,
    residence,
    designation,
    pastExperience,
    courses,
    subject,
  } = req.body;
  const newTeacher = new Teacher({
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    phoneNumber: phoneNumber,
    gender: gender,
    dateOfBirth: dateOfBirth,
    residence: residence,
    designation: designation,
    pastExperience: pastExperience,
  });
  newTeacher.photograph.url = req.file.path.replace(
    "upload/",
    "upload/w_200,c_scale/"
  );
  newTeacher.photograph.filename = req.file.filename;
  for (let course of courses) {
    const foundCourse = await Course.findOne({ title: course });
    if (!foundCourse) {
      if (course.length) {
        req.flash("error", "Incorrect course name");
        res.redirect("/addteacher");
      }
    } else {
      newTeacher.courses.push(foundCourse);
      foundCourse.teachers.push(newTeacher);
      await foundCourse.save();
    }
  }
  console.log(newTeacher);
  const foundSubject = await Subject.findOne({ title: subject });
  if (!foundSubject) {
    req.flash("error", "Subject could not be found");
    res.redirect("/addteacher");
  } else {
    newTeacher.subject = foundSubject;
    foundSubject.teachers.push(newTeacher);
    await foundSubject.save();
  }
  await newTeacher.save();
  req.flash("success", "Successfully added new teacher");
  res.redirect(
    `/register/?emailAddress=${newTeacher.emailAddress}&username=${newTeacher.phoneNumber}&role=Teacher&teacherId=${newTeacher.teacherId}`
  );
};

module.exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  const foundTeacher = await Teacher.findById(id);
  if (!foundTeacher) {
    req.flash("error", "Requested teacher could not be found");
    res.redirect("/teachersearch");
  } else {
    if (foundTeacher.photograph) {
      await cloudinary.uploader.destroy(foundTeacher.photograph.filename);
    }
    for (let courseId of foundTeacher.courses) {
      const updatedCourse = await Course.findByIdAndUpdate(courseId, {
        $pull: { teachers: id },
      });
    }
    const updatedSubject = await Subject.findByIdAndUpdate(
      foundTeacher.subject,
      {
        $pull: { teachers: id },
      }
    );
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    req.flash("success", "Teacher successfully deleted from the database");
    res.redirect("/teachersearch");
  }
};

module.exports.editTeacher = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    gender,
    dateOfBirth,
    residence,
    designation,
    pastExperience,
    courses,
  } = req.body;
  const foundTeacher = await Teacher.findByIdAndUpdate(id, {
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    gender: gender,
    dateOfBirth: dateOfBirth,
    residence: residence,
    designation: designation,
    pastExperience: pastExperience,
  });
  if (!foundTeacher) {
    req.flash("error", "Requested teacher could not be found");
    res.redirect("/teachersearch");
  } else {
    for (let course of foundTeacher.courses) {
      const updatedTeacher = await Teacher.findByIdAndUpdate(id, {
        $pull: { courses: course._id },
      });
      const updatedCourse = await Course.findByIdAndUpdate(course._id, {
        $pull: { teachers: foundTeacher._id },
      });
    }
    for (let course of courses) {
      const foundCourse = await Course.findOne({ title: course });
      if (!foundCourse) {
        if (course.length) {
          req.flash("error", "Incorrect course name entered");
          res.redirect(`/teachers/${foundTeacher._id}/edit`);
        }
      } else {
        await foundTeacher.courses.push(foundCourse);
        await foundCourse.teachers.push(foundTeacher);
        await foundCourse.save();
      }
    }
    if (foundTeacher.photograph) {
      await cloudinary.uploader.destroy(foundTeacher.photograph.filename);
    }
    foundTeacher.photograph.url = req.file.path.replace(
      "upload/",
      "upload/w_200,c_scale/"
    );
    foundTeacher.photograph.filename = req.file.filename;
    await foundTeacher.save();
    console.log(foundTeacher);
    req.flash("success", "Teacher successfully modified");
    res.redirect(`/teachers/${foundTeacher._id}`);
  }
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const foundTeacher = await Teacher.findById(id).populate("courses");
  if (!foundTeacher) {
    req.flash("error", "Requested Teacher could not be found");
    res.redirect("/teachersearch");
  }
  const coursesList = await Course.find();
  let courseTitles = [];
  for (let course of coursesList) {
    courseTitles.push(course.title);
  }
  res.render("teachers/edit", { foundTeacher, courseTitles });
};

module.exports.showTeacher = async (req, res, next) => {
  const { id } = req.params;
  const foundTeacher = await Teacher.findById(id)
    .populate("courses")
    .populate("subject");
  if (!foundTeacher) {
    req.flash("error", "Requested teacher could not found");
    res.redirect("/teachersearch");
  }
  res.render("teachers/show", { foundTeacher });
  // console.log(foundTeacher);
};
