const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createPost, getPost, getAllPost, updatePost, deletePost } = require("../Controllers/PostController");
const ensureAuthenticated = require("../Middleware/Auth");

// Memory storage: files stored in RAM as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protected routes
router.post("/", ensureAuthenticated, upload.single("coverImage"), createPost);
router.get("/:slug", ensureAuthenticated, getPost);
router.get("/", ensureAuthenticated, getAllPost);
router.put("/:slug", ensureAuthenticated, upload.single("coverImage"), updatePost);
router.delete("/:slug", ensureAuthenticated, deletePost);

module.exports = router;