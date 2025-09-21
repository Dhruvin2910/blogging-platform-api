const express = require("express");
const router = express.Router({ mergeParams:true });

const { createComment, deleteComment, getAllComment } = require("../Controllers/CommentController");
const ensureAuthenticated = require("../Middleware/Auth");

// Protected Route
router.get("/", ensureAuthenticated, getAllComment);
router.post("/", ensureAuthenticated, createComment);
router.delete("/:commentId", ensureAuthenticated, deleteComment);
 
module.exports = router;