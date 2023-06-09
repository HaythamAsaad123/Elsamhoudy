const AdminModel = require("../models/admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const logout = async (req, res, next) => {
  const admin = req.admin;
  await AdminModel.findOneAndUpdate(
    { _id: admin._id },
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

  const user = await AdminModel.findOne({ email });
  if (!user)
    return next(res.status(404).json({ error: "Invalid National ID or Password !" }));

  const validPass = await user.comparePassword(password);
  if (!validPass)
    return next(res.status(404).json({ error: "Invalid National ID or Password !" }));

  const token = await tokenCreator(user.userName, user.id);
  // save new token
  const options = { runValidators: true, new: true };
  await AdminModel.findOneAndUpdate(
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
      res.status(201).send("Account Created Successfully");
    })
    .catch((e) => {
      res.status(400).json(e);
    });
};

const create = async function (adminDetails) {
  const newAdmin = await AdminModel.create(adminDetails);
  const { userName, _id } = newAdmin;

  await tokenCreator(userName, _id);

  return newAdmin.token;
};

const update = function (req, res, next) {
  const { id } = req.params;
  const editedData = req.body;
  const userId = req.admin.id;

  _editAdmin(userId, id, editedData)
    .then(() => {
      res.send("edited successfully");
    })
    .catch(() => {
      next(res.status(401).json({ error: "Unauthorized !" }));
    });
};

const _editAdmin = function (userID, id, editedData) {
  if (userID === id) {
    const options = { runValidators: true, new: true };
    return AdminModel.findOneAndUpdate({ _id: id }, editedData, options).exec();
  } else {
    throw "UN_AUTH";
  }
};

module.exports = {
  login,
  signup,
  update,
  logout,
};