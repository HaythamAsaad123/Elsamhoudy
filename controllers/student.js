const StudentModel = require("../models/student");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { use } = require("../routers");
require("dotenv").config();
const bcrypt = require("bcrypt");
const logout = async (req, res, next) => {
  const student = req.student;
  await StudentModel.findOneAndUpdate(
    { _id: student._id },
    { token: "" },
    { new: true, runValidators: true }
  );
  res.status(200).json({ Message: "logout" });
};

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(res.status(400).json({ error: "All fields are required !" }));
  }

  const user = await StudentModel.findOne({ email });
  if (!user)
    return next(res.status(404).json({ error: "Invalid National ID or Password !" }));

  const validPass = await user.comparePassword(password);
  if (!validPass)
    return next(res.status(404).json({ error: "Invalid National ID or Password !" }));

  const token = await tokenCreator(user.userName, user.id);
  // save new token
  const options = { runValidators: true, new: true };
  await StudentModel.findOneAndUpdate(
    { _id: user._id },
    { token: token },
    options
  ).exec();
  res.json({ token: token, userName: user.userName });
}

const tokenCreator = async function (userName, _id) {
  const token = await jwt.sign({ userName, id: _id }, process.env.SECRETKEY, {
    expiresIn: "1d",
  });
  return token;
};

const signup = async function (req, res) {
  create(req.body)
    .then(() => {
      res.status(201).send("Student Created Successfully");
    })
    .catch((e) => {
      res.status(400).json(e);
    });
};

const create = async function (studentDetails) {
  const newStudent = await StudentModel.create(studentDetails);
  const { userName, _id } = newStudent;

  await tokenCreator(userName, _id);

  return newStudent.token;
};

const deleteStudent = async function (req, res, next) {
  const { id } = req.params;
  await StudentModel.deleteOne({ _id: id })
    .then(() => {
      res.send("Student Deleted Successfully");
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
    });
};

const deleteSubject = async function (req, res, next) {
  const { id, idOfSubject } = req.params;
  var student = await StudentModel.findOne({ _id: id });
  var subjects = [];
  if (student.subjects) subjects = [...student.subjects];
  if (subjects && subjects.length > 0)
    subjects = subjects.filter((subject) => {
      if (subject._id.toString() == idOfSubject.toString()) {
      } else return subject;
    });
  await StudentModel.findOneAndUpdate({
    _id: id,
    subjects: subjects ? subjects : [],
  })
    .then(() => {
      res.send("Subject Deleted Successfully");
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
    });
};

const update = function (req, res, next) {
  const { id } = req.params;
  const editedData = req.body;

  _editAdmin(id, editedData)
    .then(() => {
      res.send("Student Edited Successfully");
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
    });
};

const getAllStudents = async function (req, res, next) {
  const admin = req.admin;
  if (!admin) {
    next(res.status(401).json({ error: "Unauthorized !" }));
    return;
  } else {
    var students = await StudentModel.find({});
    res.status(200).json(students);
    return;
  }
};

const getSubjectsForAdmin = async function (req, res, next) {
  const { id } = req.params;
  let student = await StudentModel.findOne({ _id: id });
  if (!student) {
    next(res.status(401).json({ error: "Unauthorized !" }));
    return;
  } else {
    res
      .status(200)
      .json({ subjects: student.subjects ? student.subjects : [] });
    return;
  }
};

const getSubjects = function (req, res, next) {
  const student = req.student;
  if (!student) {
    next(res.status(401).json({ error: "Unauthorized !" }));
    return;
  } else {
    res
      .status(200)
      .json({ subjects: student.subjects ? student.subjects : [] });
    return;
  }
};

const addSubject = function (req, res, next) {
  const { id } = req.params;
  const editedData = req.body;
  if (!editedData.subjectName || !editedData.subjectGrade) {
    res.send("Required Feilds Name, Grade");
    return;
  }
  _addSubjectWithGrade(id, editedData)
    .then((msg) => {
      if (msg == "ok") {
        res.send("Subject Added Successfully");
        return;
      } else {
        res.send(msg);
        return;
      }
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
      return;
    });
};

const editSubject = function (req, res, next) {
  const { id, idOfSubject } = req.params;
  const editedData = req.body;
  _editSubjectDetails(id, idOfSubject, editedData)
    .then((msg) => {
      if (msg == "ok") {
        res.send("Subject Edited Successfully");
        return;
      } else {
        res.send(msg);
        return;
      }
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
      return;
    });
};

const _editAdmin = function (id, editedData) {
  const options = { runValidators: true, new: true };
  if (editedData.password) {
    editedData.password = bcrypt.hashSync(
      editedData.password,
      bcrypt.genSaltSync(10)
    );
  }
  return StudentModel.findOneAndUpdate({ _id: id }, editedData, options).exec();
};
const _addSubjectWithGrade = async function (id, editedData) {
  try {
    const options = { runValidators: true, new: true };
    var subjectObj = {
      subjectName: editedData.subjectName,
      subjectGrade: editedData.subjectGrade,
    };
    var student = await StudentModel.findOneAndUpdate(
      { _id: id },
      {
        $push: { subjects: subjectObj },
      },
      options
    ).exec();
    return "ok";
  } catch (err) {
    if (err.message) {
      console.log(err.message, "message");
      return err.message;
    } else if (!err.message && err.stack) {
      console.log(err.stack, "details");
      return err.stack;
    }
  }
};
const _editSubjectDetails = async function (id, idOfSubject, editedData) {
  try {
    const options = { runValidators: true, new: true };
    await StudentModel.findOneAndUpdate(
      { _id: id, "subjects._id": idOfSubject },
      {
        $set: {
          "subjects.$.subjectName": editedData.subjectName,
          "subjects.$.subjectGrade": editedData.subjectGrade,
        },
      },
      options
    ).exec();
    return "ok";
  } catch (err) {
    if (err.message) {
      console.log(err.message, "message");
      return err.message;
    } else if (!err.message && err.stack) {
      console.log(err.stack, "details");
      return err.stack;
    }
  }
};
module.exports = {
  login,
  signup,
  update,
  logout,
  addSubject,
  editSubject,
  getSubjects,
  getAllStudents,
  getSubjectsForAdmin,
  deleteStudent,
  deleteSubject,
};
