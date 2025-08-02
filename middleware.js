const {
  studentSchema,
  editStudentSchema,
  teacherSchema,
  editTeacherSchema,
  courseSchema,
  editCourseSchema,
  marksSchema,
  editMarksSchema,
  attendanceSchema,
  subjectSchema,
} = require("./schemas.js");

module.exports.validateStudent = (req, res, next) => {
  const { error } = studentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateEditStudent = (req, res, next) => {
  const { error } = editStudentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateTeacher = (req, res, next) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateEditTeacher = (req, res, next) => {
  const { error } = editTeacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateCourse = (req, res, next) => {
  const { error } = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateEditCourse = (req, res, next) => {
  const { error } = editCourseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateMarks = (req, res, next) => {
  const { error } = marksSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateEditMarks = (req, res, next) => {
  const { error } = editMarksSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.validateAttendance = (req, res, next) => {
  const { error } = attendanceSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in to use this feature");
    return res.redirect("/login");
  }
  return next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role == "Admin") {
    return next();
  }
  // return console.log("Not an admin");
  req.flash("error", "You must be an Admin to use this feature");
  return res.redirect("/");
};

module.exports.isStudent = (req, res, next) => {
  if (req.user.role == "Student") {
    return next();
  }
  // return console.log("Not a student");
  res.flash("error", "You must be a Student to use this feature");
  return res.redirect("/");
};

module.exports.isTeacher = (req, res, next) => {
  if (req.user.role == "Teacher") {
    return next();
  }
  // return console.log("Not a teacher");
  req.flash("error", "You must be a Teacher to use this feature");
  return res.redirect("/");
};

module.exports.isTeacherOrAdmin = (req, res, next) => {
  if (req.user.role == "Admin" || req.user.role == "Teacher") {
    return next();
  }
  // return console.log("Neither a teacher nor an admin");
  req.flash(
    "error",
    "You must be either an Admin or a Teacher to use this feature"
  );
  return res.redirect("/");
};

module.exports.isStudentOrAdmin = (req, res, next) => {
  if (req.user.role == "Student" || req.user.role == "Admin") {
    return next();
  }
  // return console.log("Neither a student nor an admin");
  req.flash(
    "error",
    "You must be either a student or an Admin to use this feature"
  );
  return res.redirect("/");
};

module.exports.isStudentOrTeacher = (req, res, next) => {
  if (req.user.role == "Teacher" || req.user.role == "Student") {
    return next();
  }
  // return console.log("Neither a student nor a teacher");
  req.flash(
    "error",
    "You must be either a student or a Teacher to use this feature"
  );
};
