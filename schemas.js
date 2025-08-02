const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.studentSchema = Joi.object({
  student: Joi.object({
    firstName: Joi.string().required().escapeHTML(),
    lastName: Joi.string().escapeHTML(),
    emailAddress: Joi.string().required().escapeHTML(),
    phoneNumber: Joi.number().required().integer().min(0),
    gender: Joi.string()
      .required()
      .valid("Male", "Female", "Others")
      .escapeHTML(),
    dateOfBirth: Joi.date().required(),
    residence: Joi.string().required().escapeHTML(),
    classTenthSchool: Joi.string().required().escapeHTML(),
    classTenthBoard: Joi.string()
      .required()
      .valid(
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
        "WBCHSE"
      )
      .escapeHTML(),
    classTenthScore: Joi.number().integer().min(0).max(100).required(),
    classTenthYear: Joi.number().integer().min(2010).max(2022).required(),
    classTwelfthSchool: Joi.string().required().escapeHTML(),
    classTwelfthBoard: Joi.string()
      .required()
      .valid(
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
        "WBCHSE"
      )
      .escapeHTML(),
    classTwelfthScore: Joi.number().integer().min(0).max(100).required(),
    classTwelfthYear: Joi.number().integer().min(2010).max(2022).required(),
    course: Joi.string().required().escapeHTML(),
  }),
});

module.exports.editStudentSchema = Joi.object({
  firstName: Joi.string().required().escapeHTML(),
  lastName: Joi.string().escapeHTML(),
  phoneNumber: Joi.number().required().integer().min(0),
  gender: Joi.string().valid("Male", "Female", "Others").escapeHTML(),
  dateOfBirth: Joi.date().required(),
  residence: Joi.string().required().escapeHTML(),
  course: Joi.string().required().escapeHTML(),
});

module.exports.teacherSchema = Joi.object({
  teacher: Joi.object({
    firstName: Joi.string().required().escapeHTML(),
    lastName: Joi.string().escapeHTML(),
    emailAddress: Joi.string().required().escapeHTML(),
    phoneNumber: Joi.number().required().integer().min(0),
    gender: Joi.string()
      .valid("Male", "Female", "Others")
      .required()
      .escapeHTML(),
    dateOfBirth: Joi.date().required(),
    residence: Joi.string().required().escapeHTML(),
    designation: Joi.string()
      .required()
      .valid(
        "Professor",
        "Assistant Professor",
        "Associate Professor",
        "Instructor"
      )
      .escapeHTML(),
    pastExperience: Joi.string().required().escapeHTML(),
    courses: Joi.array().items(Joi.string()),
    subject: Joi.string().required().escapeHTML(),
  }),
});

module.exports.editTeacherSchema = Joi.object({
  teacher: Joi.object({
    firstName: Joi.string().required().escapeHTML(),
    lastName: Joi.string().escapeHTML(),
    phoneNumber: Joi.number().integer().required().min(0),
    gender: Joi.string()
      .required()
      .valid("Male", "Female", "Others")
      .escapeHTML(),
    dateOfBirth: Joi.date().required(),
    residence: Joi.string().required().escapeHTML(),
    designation: Joi.string()
      .required()
      .valid(
        "Professor",
        "Assistant Professor",
        "Associate Professor",
        "Instructor"
      )
      .escapeHTML(),
    pastExperience: Joi.string().required().escapeHTML(),
    courses: Joi.array().items(Joi.string()),
  }),
});

(module.exports.subjectSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
})),
  (module.exports.courseSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    year: Joi.number().valid(1, 2, 3, 4).required(),
    semester: Joi.string().required().valid("Even", "Odd").escapeHTML(),
    duration: Joi.number().required(),
    subjects: Joi.array(),
  }));

module.exports.editCourseSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  year: Joi.number().valid(1, 2, 3, 4).required(),
  semester: Joi.string().required().valid("Even", "Odd").escapeHTML(),
  duration: Joi.number().required(),
  subjects: Joi.array(),
});

module.exports.marksSchema = Joi.object({
  maxMarks: Joi.number().required().integer(),
  description: Joi.string().required().valid("Mid-Sem", "End-Sem").escapeHTML(),
  course: Joi.string().required().escapeHTML(),
  scores: Joi.array(),
});

module.exports.editMarksSchema = Joi.object({
  description: Joi.string().required().valid("Mid-Sem", "End-Sem").escapeHTML(),
  subject: Joi.string().required().escapeHTML(),
  newMarks: Joi.number().required().integer(),
  studentId: Joi.string().required().escapeHTML(),
  entryRecord: Joi.string().required().escapeHTML(),
});

module.exports.attendanceSchema = Joi.object({
  attendance: Joi.array().required().items(Joi.string()),
  course: Joi.string().required().escapeHTML(),
  date: Joi.date().required(),
});
