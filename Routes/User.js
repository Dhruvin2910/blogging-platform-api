const express = require("express");
const app = express();
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar } = require("../Controllers/UserController");
const userValidation = require("../Validators/UserValidation");
const ensureAuthenticated = require("../Middleware/Auth");
const multer = require("multer");

app.use(express.json());

// Memory storage: files stored in RAM as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/profile", ensureAuthenticated, getProfile);
router.put("/profile", ensureAuthenticated, userValidation, updateProfile);
router.post("/profile/avatar", ensureAuthenticated, upload.single("avatar"), uploadAvatar);

module.exports = router;