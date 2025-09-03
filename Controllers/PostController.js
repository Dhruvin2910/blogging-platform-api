const PostModel = require("../Models/Post");
const cloudinary = require("../Config/cloudinary");
const streamifier = require("streamifier");

const createPost = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and contents are required" });
    }

    let coverImageUrl;
    // upload image to cludinary if provided
    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "blog_posts" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
      coverImageUrl = result.secure_url;
    }

    const newPost = new PostModel({
      author: req.user.id,
      title,
      content,
      coverImage: coverImageUrl,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      category,
    });

    await newPost.save();

    return res
      .status(201)
      .json({ success: true, message: "Post created successfully", newPost });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPost = async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await PostModel.findOne({ slug })
      .populate("author", "avatar")
      .populate("comments.user", "avatar");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, post });
  } catch (err) {
    console.error(err);
    return res.status(500).jon({ success: false, message: "Server error" });
  }
};

const getAllPost = async (req, res) => {
  try {
    // optional query params
    const { page = 1, limit = 10, category, tag, author, status } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (tag) filter.tag = tag;
    if (author) filter.author = author;

    const skip = (page - 1) * limit;

    const posts = await PostModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name avatar")
      .populate("comments.user", "name avatar");

    const totalPosts = await PostModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, tags, category } = req.body;

    let post = await PostModel.findOne({ slug });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "blog_posts" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
      post.coverImage = result.secure_url;
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags.split(",");
    if (category) post.category = category;

    await post.save();

    return res
      .status(200)
      .json({ success: true, message: "Post updated", post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Find post first (don't delete yet)
    const post = await PostModel.findOne({ slug });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // 2. Check authorization
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this post" });
    }

    // 3. Delete image from Cloudinary (only if stored with public_id)
    if (post.coverImage && post.coverImage.public_id) {
      await cloudinary.uploader.destroy(post.coverImage.public_id);
    }

    // 4. Delete post from DB
    await PostModel.deleteOne({ slug });

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = { createPost, getPost, getAllPost, updatePost, deletePost };
