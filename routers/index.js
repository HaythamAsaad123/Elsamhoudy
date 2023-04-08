const express = require("express");
const router = express.Router();
const admin = require("./admin");
const student = require("./student");
router.use("/admin", admin);
router.use("/student", student);
// router.get("/", (req, res) => {
// 	res.status(200).json({ message: "Welcome to Food Lancer Server!" });
// });
module.exports = router;