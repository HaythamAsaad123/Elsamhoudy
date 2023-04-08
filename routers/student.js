const router = require("express").Router();
const accountController = require("../controllers/student");
const adminAuth = require("../middleware/adminAuth");
const studentAuth = require("../middleware/studentAuth");

router.post("/login", accountController.login);
router.get("/logout", studentAuth, accountController.logout);
router.post("/signup", adminAuth, accountController.signup);
router.put("/update/:id", adminAuth, accountController.update);
router.post("/addSubject/:id", adminAuth, accountController.addSubject);
router.put(
  "/editSubject/:id/:idOfSubject",
  adminAuth,
  accountController.editSubject
);
router.get("/getSubjects", studentAuth, accountController.getSubjects);
router.get(
  "/getSubjectsForAdmin/:id",
  adminAuth,
  accountController.getSubjectsForAdmin
);
router.get("/getAllStudents", adminAuth, accountController.getAllStudents);
router.delete("/delete/:id", adminAuth, accountController.deleteStudent);
router.delete(
  "/deleteSubject/:id/:idOfSubject",
  adminAuth,
  accountController.deleteSubject
);

module.exports = router;
