const Subject = require("../models/subject");
const Course = require("../models/course");

module.exports.newSubject = async (req, res) => {
  const { title } = req.body;
  const foundSubjects = await Subject.find({ title: title });
  if (foundSubjects.length) {
    req.flash("error", "Another subject with the same name exists");
    res.redirect("/addsubject");
  } else {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    req.flash("success", "New subject added");
    res.redirect("/");
  }
};

module.exports.renderNewForm = async (req, res) => {
  res.render("subjects/new");
};
