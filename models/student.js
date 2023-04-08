const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      minLength: [5, "Must be at least 5"],
      maxLength: [20, "Must be at latest 20"],
      trim: true,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      minLength: [3, "Must be at least 3"],
      maxLength: [20, "Must be at latest 20"],
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: [3, "Must be at least 3"],
      maxLength: [20, "Must be at latest 20"],
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/g,
        "Please fill a valid password",
      ],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      match: [/^01[0125]\d{1,8}$/g, "Please fill a valid Phone Number"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
      match: [
        /^([1-9]{1})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})[0-9]{3}([0-9]{1})[0-9]{1}$/,
        "Please fill a valid email address",
      ],
    },
    level: {
      type: String,
      trim: true,
      required: true,
    },
    token: {
      type: String,
      default: "",
    },
    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
        },
        subjectGrade: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

studentSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  next();
});
studentSchema.methods.comparePassword = function (password) {
  const that = this;
  return bcrypt.compareSync(password, that.password);
};
const studentModel = mongoose.model("student", studentSchema);
module.exports = studentModel;
