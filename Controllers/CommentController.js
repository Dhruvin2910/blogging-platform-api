const { PostModel } = require("../Models/Post");

// Create comment
const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const user = req.user;
    const { postId } = req.params;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const newComment = {
      user: user.id,
      comment: text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Nested Comment
const createNestedComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId, commentId } = req.params;
    const user = req.user;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "POst not found" });
    }

    const parentComment = await post.comments.id(commentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({ success: false, message: "Parent comment not found" });
    }

    const newNestedComment = {
      user: user.id,
      comment: text,
      createdAt: new Date(),
    };

    parentComment.replies.push(newNestedComment);

    await post.save();

    res.status(200).json({ success: true, newNestedComment });
  } catch (err) {
    console.error("Create Nested Comment Error: ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get all comments for a post
const getAllComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate(
      "comments.user",
      "name email"
    ); 
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    const sortedComments = post.comments.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res
      .status(200)
      .json({
        success: true,
        conut: sortedComments.length,
        comments: sortedComments,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    const { postId, commentId } = req.params;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    console.log(post.author.toString());
    console.log(user.id.toString());
    console.log(comment.user.toString());

    // Authorization: admin, post author, or comment author
    if (
      user.role !== "admin" &&
      post.author.toString() !== user.id.toString() &&
      comment.user.toString() !== user.id.toString()
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Not authorized to delete this comment",
        });
    }

    // Remove comment
    comment.deleteOne();
    await post.save();

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createComment,
  createNestedComment,
  getAllComment,
  deleteComment,
};
