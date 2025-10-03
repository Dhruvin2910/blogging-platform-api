const mongoose = require("mongoose");
const slugify = require("slugify");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [this],
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: {
    url: { type: String },
    public_id: { type: String },
  },
  tags: [String],
  category: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref:"User", default: [] }],
  comments: [commentSchema],
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-validate hook for slug & excerpt

postSchema.pre("validate", async function (next) {
  const Post = mongoose.model("Post", postSchema);

  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Check for exisiting posts with same slug
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt =
      this.content.substring(0, 150) + (this.content.length > 150 ? "..." : "");
  }

  next();
});

const PostModel = mongoose.model("Post", postSchema);
const CommentModel = mongoose.model("Comment", commentSchema);
module.exports = { PostModel, CommentModel };
