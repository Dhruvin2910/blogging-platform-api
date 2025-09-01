const express = require("express");
const { signup, login } = require("../Controllers/AuthController");
const { signupValidation, loginValidation } = require("../Validators/AuthValidation");
const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login",  loginValidation,login);

module.exports = router;