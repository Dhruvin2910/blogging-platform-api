const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../Controllers/AuthController");
const { signupValidation, loginValidation } = require("../Validators/AuthValidation");
const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login",  loginValidation,login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;