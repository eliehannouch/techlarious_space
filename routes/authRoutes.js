const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/signup", userController.signUp);
router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPassword);

router.patch("/resetPassword/:token", userController.resetPassword);

module.exports = router;
