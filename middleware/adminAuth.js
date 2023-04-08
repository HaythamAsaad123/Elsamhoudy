const jwt = require("jsonwebtoken");
const AdminModel = require("../models/admin");
require("dotenv").config();
async function adminAuth(req, res, next) {
  try {
    const { token } = req.headers;
    const payload = jwt.verify(token, process.env.SECRETKEY);
    const admin = await AdminModel.findById(payload.id);
    if (!admin) {
      return next(res.status(401).json({ error: "Invalid Token !" }));
    }
    req.admin = admin;
    next();
  } catch (error) {
    next(res.status(401).json({ error: "Invalid Token !" }));
  }
}
module.exports = adminAuth;
