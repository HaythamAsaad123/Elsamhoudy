const jwt = require("jsonwebtoken");
require("dotenv").config();
const studentModel = require("../models/student");

async function studentAuth(req, res, next) {
  try {
    const { token } = req.headers;
    const payload = jwt.verify(token, process.env.SECRETKEY);
    const student = await studentModel.findOne({
      _id: payload.id,
      token,
    });
    if (!student) {
      return next(res.status(404).json({ error: "ID not found !" }));
    }
    req.student = student;
    next();
  } catch (error) {
    next(res.status(401).json({ error: "Invalid Token !" }));
  }
}
module.exports = studentAuth;
