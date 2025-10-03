const express = require("express");
const router = express.Router();

const toggleLike = require("../Controllers/LikeController");
const ensureAuthenticated = require("../Middleware/Auth");

// Protected Route
router.post("/:postId/like", ensureAuthenticated, toggleLike);
 
module.exports = router;