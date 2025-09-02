const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createPost, getPost, getAllPost, updatePost, deletePost } = require("../Controllers/PostController");
const ensureAuthenticated = require("../Middleware/Auth");

// Memory storage: files stored in RAM as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/createPost", ensureAuthenticated, upload.single("coverImage"), createPost);
router.get("/getPost/:slug", ensureAuthenticated, getPost);
router.get("/getPosts", ensureAuthenticated, getAllPost);
router.put("/updatePost/:slug", ensureAuthenticated, updatePost);
router.delete("/deletePost/:slug", ensureAuthenticated, deletePost);

module.exports = router;