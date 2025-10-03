const { PostModel } = require("../Models/Post");

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await PostModel.findById(postId);
    
    if (!post) {
      return res
        .status(500)
        .json({ success: false, message: "Post not found" });
    }

    if(!Array.isArray(post.likes)) post.likes = [];

    if (post.likes.includes(userId)) {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      ).select("likes");
      return res
        .status(200)
        .json({
          success: true,
          message: "Post unliked",
          likesCount: updatedPost.likes.length,
        });
    } else {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      ).select("likes");

      return res
        .status(200)
        .json({
          success: true,
          message: "Post liked",
          likesCount: updatedPost.likes.length,
        });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = toggleLike;
