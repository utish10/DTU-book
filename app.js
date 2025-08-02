if (process.env.NODE_env != "production") {
  require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const courses = require("./controllers/courses");
const subjects = require("./controllers/subjects");
const students = require("./controllers/students");
const teachers = require("./controllers/teachers");
const mongoose = require("mongoose");
const attendance = require("./controllers/attendance");
const users = require("./controllers/users");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/CatchAsync");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const marks = require("./controllers/marks");
const req = require("express/lib/request");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const multer = require("multer");
const { storage } = require("./cloudinary/index");
const { get, redirect } = require("express/lib/response");
const upload = multer({ storage });
const flash = require("connect-flash");
const Joi = require("joi");
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
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/uni-reg";

const validateStudent = (req, res, next) => {
  const { error } = studentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateEditStudent = (req, res, next) => {
  const { error } = editStudentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateTeacher = (req, res, next) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateEditTeacher = (req, res, next) => {
  const { error } = editTeacherSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateCourse = (req, res, next) => {
  const { error } = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateEditCourse = (req, res, next) => {
  const { error } = editCourseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateMarks = (req, res, next) => {
  const { error } = marksSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateEditMarks = (req, res, next) => {
  const { error } = editMarksSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const validateAttendance = (req, res, next) => {
  const { error } = attendanceSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in to use this feature");
    return res.redirect("/login");
  }
  return next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role == "Admin") {
    return next();
  }
  // return console.log("Not an admin");
  req.flash("error", "You must be an Admin to use this feature");
  return res.redirect("/");
};

const isStudent = (req, res, next) => {
  if (req.user.role == "Student") {
    return next();
  }
  // return console.log("Not a student");
  res.flash("error", "You must be a Student to use this feature");
  return res.redirect("/");
};

const isTeacher = (req, res, next) => {
  if (req.user.role == "Teacher") {
    return next();
  }
  // return console.log("Not a teacher");
  req.flash("error", "You must be a Teacher to use this feature");
  return res.redirect("/");
};

const isTeacherOrAdmin = (req, res, next) => {
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

const isStudentOrAdmin = (req, res, next) => {
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

const isStudentOrTeacher = (req, res, next) => {
  if (req.user.role == "Teacher" || req.user.role == "Student") {
    return next();
  }
  // return console.log("Neither a student nor a teacher");
  req.flash(
    "error",
    "You must be either a student or a Teacher to use this feature"
  );
};

const validateSubject = (req, res, next) => {
  const { error } = subjectSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    return next();
  }
};

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { resolveTxt } = require("dns");
const subject = require("./models/subject");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const secret = process.env.SECRET || "thisshouldbeabettersecret";
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store: MongoStore.create({ mongoUrl: dbUrl }),
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//"mongodb://localhost:27017/uni-reg"

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
app.use(mongoSanitize());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const generatePassword = require("password-generator");

const maxLength = 8;
const minLength = 8;
const uppercaseMinCount = 1;
const lowercaseMinCount = 1;
const numberMinCount = 1;
// const specialMinCount = 9;
const UPPERCASE_RE = /([A-Z])/g;
const LOWERCASE_RE = /([a-z])/g;
const NUMBER_RE = /([\d])/g;
// const SPECIAL_CHAR_RE = /([\?\-])/g;
const NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
  var uc = password.match(UPPERCASE_RE);
  // var lc = password.match(LOWERCASE_RE);
  var n = password.match(NUMBER_RE);
  // var sc = password.match(SPECIAL_CHAR_RE);
  var nr = password.match(NON_REPEATING_CHAR_RE);
  return (
    password.length >= minLength &&
    !nr &&
    uc &&
    uc.length >= uppercaseMinCount &&
    // lc &&
    // lc.length >= lowercaseMinCount &&
    n &&
    n.length >= numberMinCount
    // sc &&
    // sc.length >= specialMinCount
  );
}

function customPassword() {
  var password = "";
  var randomLength =
    Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  while (!isStrongEnough(password)) {
    password = generatePassword(randomLength, false, /[\w\d\?\-]/);
  }
  return password;
}

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", async (req, res, next) => {
  res.render("home");
});

//Courses Routes

app.get("/courses", isLoggedIn, catchAsync(courses.allCourses));

app.get(
  "/courses/:id/edit",
  isLoggedIn,
  isAdmin,
  catchAsync(courses.renderEditForm)
);

app.get("/addcourse", isLoggedIn, catchAsync(courses.renderNewForm));

app.post(
  "/courses",
  isLoggedIn,
  isAdmin,
  validateCourse,
  catchAsync(courses.newCourse)
);

app.get("/courses/:id", isLoggedIn, catchAsync(courses.showCourse));

app.delete(
  "/courses/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(courses.deleteCourse)
);

app.put(
  "/courses/:id",
  isLoggedIn,
  isAdmin,
  validateEditCourse,
  catchAsync(courses.editCourse)
);

//Subjects Routes

app.get("/addsubject", isLoggedIn, isAdmin, subjects.renderNewForm);

app.post(
  "/subjects",
  isLoggedIn,
  isAdmin,
  validateSubject,
  catchAsync(subjects.newSubject)
);

//Students Routes

app.get(
  "/students/:id/edit",
  isLoggedIn,
  isAdmin,
  catchAsync(students.renderEditForm)
);

app.get(
  "/studentsearch",
  isLoggedIn,
  isTeacherOrAdmin,
  catchAsync(students.renderSearchForm)
);

app.post(
  "/studentsearch",
  isLoggedIn,
  isTeacherOrAdmin,
  catchAsync(students.searchStudent)
);

app.get(
  "/students",
  isLoggedIn,
  isTeacherOrAdmin,
  catchAsync(students.allStudents)
);

app.post(
  "/students",
  isLoggedIn,
  isAdmin,
  validateStudent,
  upload.single("photograph"),
  catchAsync(students.newStudent)
);

app.get("/addstudent", isLoggedIn, isAdmin, catchAsync(students.renderNewForm));

app.get("/students/:id", isLoggedIn, catchAsync(students.showStudent));

app.delete(
  "/students/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(students.deleteStudent)
);

app.put(
  "/students/:id",
  isLoggedIn,
  isAdmin,
  validateEditStudent,
  catchAsync(students.editStudent)
);

//Teachers Routes

app.get("/teachersearch", isLoggedIn, catchAsync(teachers.renderSearchForm));

app.post("/teachersearch", isLoggedIn, catchAsync(teachers.teacherSearch));

app.get("/teachers", isLoggedIn, catchAsync(teachers.allTeachers));

app.get("/addteacher", isLoggedIn, isAdmin, catchAsync(teachers.renderNewForm));

app.post(
  "/teachers",
  isLoggedIn,
  isAdmin,
  validateTeacher,
  upload.single("photograph"),
  catchAsync(teachers.newTeacher)
);

app.get("/teachers/:id", isLoggedIn, catchAsync(teachers.showTeacher));

app.delete(
  "/teachers/:id",
  isLoggedIn,
  isAdmin,
  catchAsync(teachers.deleteTeacher)
);

app.get(
  "/teachers/:id/edit",
  isLoggedIn,
  isAdmin,
  catchAsync(teachers.renderEditForm)
);

app.put(
  "/teachers/:id",
  isLoggedIn,
  isAdmin,
  validateEditTeacher,
  upload.single("photograph"),
  catchAsync(teachers.editTeacher)
);

//Attendance Routes

app.post(
  "/attendance",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.newRecord)
);

app.get(
  "/attendance/students/:studentId/course/:courseId/subjects/:subjectId",
  isLoggedIn,
  catchAsync(students.showAttendance)
);

app.get(
  "/attendance/selectcourse",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.renderSelectCourse)
);

app.post(
  "/attendance/selectcourse",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.selectCourse)
);

app.get(
  "/attendance/newrecord",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.renderNewAttendanceForm)
);

app.post(
  "/attendance/newrecord",
  isLoggedIn,
  isTeacher,
  validateAttendance,
  catchAsync(attendance.newRecord)
);

app.get(
  "/attendance/search",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.renderSearchForm)
);
app.post(
  "/attendance/search",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.searchAttendance)
);

app.get(
  "/attendance/:id",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.renderAttendanceCard)
);
app.delete(
  "/attendance/:id",
  isLoggedIn,
  isTeacher,
  catchAsync(attendance.deleteRecord)
);

//User Routes

app.get("/register", isLoggedIn, isAdmin, (req, res) => {
  const { emailAddress, role, username } = req.query;
  const newPassword = customPassword();
  res.render("users/register", { emailAddress, role, username, newPassword });
});

app.post("/users", isLoggedIn, isAdmin, catchAsync(users.newUser));

app.get("/login", (req, res) => {
  res.render("users/login");
});

app.get("/users/:id", isLoggedIn, isAdmin, catchAsync(users.showUser));

app.delete("/users/:id", isLoggedIn, isAdmin, catchAsync(users.deleteUser));

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  catchAsync(users.loginUser)
);

app.get("/logout", isLoggedIn, catchAsync(users.logoutUser));

//Marks Routes

app.post("/listview", isLoggedIn, isTeacher, catchAsync(marks.scoresListView));

app.get(
  "/searchmarks",
  isLoggedIn,
  isTeacher,
  catchAsync(marks.renderSearchForm)
);

app.post(
  "/searchmarks",
  isLoggedIn,
  isStudentOrTeacher,
  catchAsync(marks.searchScore)
);

app.get(
  "/scorecard",
  isLoggedIn,
  isStudentOrTeacher,
  catchAsync(marks.renderScorecard)
);

app.get(
  "/selectcourse",
  isLoggedIn,
  isTeacher,
  catchAsync(marks.renderSelectCourse)
);

app.get(
  "/newscorecard",
  isLoggedIn,
  isTeacher,
  catchAsync(marks.renderNewScorecardForm)
);

app.post(
  "/selectcourse",
  isLoggedIn,
  isTeacher,
  catchAsync(marks.selectCourse)
);

app.post(
  "/marks",
  isLoggedIn,
  isTeacher,
  isLoggedIn,
  isTeacher,
  validateMarks,
  catchAsync(marks.newEntry)
);

app.get(
  "/marks",
  isLoggedIn,
  isStudentOrTeacher,
  catchAsync(students.showMarks)
);

app.get("/editmarks", isLoggedIn, isTeacher, catchAsync(marks.renderEditForm));

app.post(
  "/editmarks",
  isLoggedIn,
  isTeacher,
  validateEditMarks,
  catchAsync(marks.editMarks)
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh No! Something went wrong";
  }
  res.render("error.ejs", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});
