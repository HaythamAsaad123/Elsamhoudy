const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const app = express();
const routers = require("./routers/index");
require("dotenv").config();
mongoose.set('strictQuery', false);
mongoose.connect(process.env.ATLS_URL, () => {
	console.log("connected to database");
});
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routers);
server.listen(3001, () => {
	console.log(`listen on port 3001`);
});