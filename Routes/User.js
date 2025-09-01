const express = require("express");
const router = express.Router();
const { updateProfile } = require("../Controllers/UserController");
const userValidation = require("../Validators/UserValidation");
const ensureAuthenticated = require("../Middleware/Auth");

router.put("/profile", ensureAuthenticated, userValidation, updateProfile);

module.exports = router;
