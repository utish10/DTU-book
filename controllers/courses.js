const Course = require("../models/course");
const Subject = require("../models/subject");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const { cloudinary } = require("../cloudinary");

module.exports.allCourses = async (req, res) => {
  const coursesList = await Course.find().populate("subjects");
  res.render("courses/index", { coursesList });
};

module.exports.renderNewForm = async (req, res) => {
  const subjects = await Subject.find();
  let subjectsTitles = [];
  for (subject of subjects) {
    subjectsTitles.push(subject.title);
  }
  res.render("courses/new", { subjectsTitles });
};

module.exports.newCourse = async (req, res) => {
  const { title, year, semester, duration, subjects } = req.body;
  const newCourse = new Course({
    title: title,
    year: year,
    semester: semester,
    duration: duration,
  });
  const foundCourses = await Course.find({ title: title });
  if (foundCourses.length) {
    req.flash("error", "Another course with the same name exists");
    res.redirect("/addcourse");
  } else {
    for (let subject of subjects) {
      const foundSubject = await Subject.findOne({ title: subject });
      if (!foundSubject) {
        if (subject.length) {
          req.flash("error", "Subject could not be found");
          res.redirect("/addcourse");
        }
      } else if (subject.length == 0) {
      } else {
        newCourse.subjects.push(foundSubject);
        foundSubject.courses.push(newCourse);
        await foundSubject.save();
      }
    }
    console.log(newCourse);
    await newCourse.save();
    req.flash("success", "New course successfully added");
    res.redirect("/courses");
  }
};

module.exports.showCourse = async (req, res) => {
  const { id } = req.params;
  const foundCourse = await Course.findById(id)
    .populate("subjects")
    .populate({
      path: "teachers",
      populate: {
        path: "subject",
      },
    })
    .populate("students");
  if (!foundCourse) {
    req.flash("error", "Requested course could not be found");
    res.redirect("/courses");
  } else {
    // let studentsList = [];
    // let teachersList = [];
    // for (let studentId of foundCourse.students) {
    //   const foundStudent = await Student.findById(studentId);
    //   studentsList.push(foundStudent);
    // }
    // for (let teacherId of foundCourse.teachers) {
    //   const foundTeacher = await Teacher.findById(teacherId).populate(
    //     "subject"
    //   );
    //   teachersList.push(foundTeacher);
    // }
    res.render("courses/show", { foundCourse });
  }
};

module.exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  const foundCourse = await Course.findById(id);
  if (!foundCourse) {
    req.flash("error", "Requested course could not be found");
    res.redirect("/courses");
  } else {
    for (let subId of foundCourse.subjects) {
      const foundSubject = await Subject.findByIdAndUpdate(subId, {
        $pull: { courses: foundCourse._id },
      });
    }
    for (let studentId of foundCourse.students) {
      const deletedStudent = await Student.findByIdAndDelete(studentId);
      if (deletedStudent.photograph) {
        await cloudinary.uploader.destroy(deletedStudent.photograph.filename);
      }
      console.log(deletedStudent);
    }
    for (let teacherId of foundCourse.teachers) {
      const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, {
        $pull: { courses: id },
      });
    }
    const deletedCourse = await Course.findByIdAndDelete(id);
    req.flash("success", "Course successfully deleted from the database");
    res.redirect("/courses");
    console.log(deletedCourse);
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const foundCourse = await Course.findById(id).populate("subjects");
  if (!foundCourse) {
    req.flash("error", "Course could not be found");
    res.redirect("/courses");
  }
  const subjects = await Subject.find();
  let subjectsTitles = [];
  for (let subject of subjects) {
    subjectsTitles.push(subject.title);
  }
  res.render("courses/edit", { foundCourse, subjectsTitles });
};

module.exports.editCourse = async (req, res) => {
  const { id } = req.params;
  const foundCourse = await Course.findById(id);
  if (!foundCourse) {
    req.flash("error", "Requested course could not be found");
    res.redirect("/courses");
  } else {
    for (let subId of foundCourse.subjects) {
      const foundSubject = await Subject.findByIdAndUpdate(subId, {
        $pull: { courses: foundCourse._id },
      });
      let updatedCourse = await Course.findByIdAndUpdate(foundCourse._id, {
        $pull: { subjects: subId },
      });
    }
    console.log(foundCourse);
    const { title, year, duration, semester, subjects } = req.body;
    await Course.findByIdAndUpdate(id, {
      title: title,
      year: year,
      semester: semester,
      duration: duration,
    });
    for (let subject of subjects) {
      if (subject.length) {
        const foundSubject = await Subject.findOne({ title: subject });
        if (!foundSubject) {
          console.log(`${subject} not found`);
        } else {
          foundCourse.subjects.push(foundSubject);
          foundSubject.courses.push(foundCourse);
          await foundSubject.save();
        }
      }
    }
    await foundCourse.save();
    req.flash("success", "Course successfully modified");
    res.redirect(`/courses/${foundCourse._id}`);
  }
};
