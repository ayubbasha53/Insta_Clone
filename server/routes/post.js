
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");

const Post = mongoose.model("Post");

// GET: Saari posts load karna.
router.get("/allpost", requireLogin, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "_id name pic")
      .populate("comments.postedBy", "_id name pic")
      .sort({ _id: -1 });

    res.json({ posts });
  } catch (err) {
    console.error("Get all posts error:", err);
    res.status(500).json({ error: "Unable to load posts" });
  }
});

// GET: Jin users ko follow karte hain unki posts.
router.get("/getsubpost", requireLogin, async (req, res) => {
  try {
    const posts = await Post.find({
      postedBy: { $in: req.user.following },
    })
      .populate("postedBy", "_id name pic")
      .populate("comments.postedBy", "_id name pic")
      .sort({ _id: -1 });

    res.json({ posts });
  } catch (err) {
    console.error("Get following posts error:", err);
    res.status(500).json({ error: "Unable to load following posts" });
  }
});

// POST: Nayi post create karna.
router.post("/createpost", requireLogin, async (req, res) => {
  try {
    const { title, body, pic } = req.body;

    if (!title || !body || !pic) {
      return res.status(422).json({
        error: "Please add all the fields.",
      });
    }

    const post = new Post({
      title,
      body,
      photo: pic,
      postedBy: req.user._id,
    });

    await post.save();
    await post.populate("postedBy", "_id name pic");

    res.status(201).json({ post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Unable to create post" });
  }
});

// GET: Logged-in user ki posts.
router.get("/mypost", requireLogin, async (req, res) => {
  try {
    const mypost = await Post.find({
      postedBy: req.user._id,
    })
      .populate("postedBy", "_id name pic")
      .sort({ _id: -1 });

    res.json({ mypost });
  } catch (err) {
    console.error("Get my posts error:", err);
    res.status(500).json({ error: "Unable to load your posts" });
  }
});

// PUT: Post ko like karna.
router.put("/like", requireLogin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ error: "Unable to like post" });
  }
});

// PUT: Post ko unlike karna.
router.put("/unlike", requireLogin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Unlike post error:", err);
    res.status(500).json({ error: "Unable to unlike post" });
  }
});

// PUT: Post par comment add karna.
router.put("/comment", requireLogin, async (req, res) => {
  try {
    const text = req.body.text;

    if (!text || !text.trim()) {
      return res.status(422).json({ error: "Comment cannot be empty" });
    }

    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {
          comments: {
            text: text.trim(),
            postedBy: req.user._id,
          },
        },
      },
      { new: true }
    )
      .populate("comments.postedBy", "_id name pic")
      .populate("postedBy", "_id name pic");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ error: "Unable to add comment" });
  }
});

// PUT: Apni post edit karna.
router.put("/editpost/:postId", requireLogin, async (req, res) => {
  try {
    const { title, body, pic } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Sirf post ka owner edit kar sakta hai.
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You are not authorized to edit this post",
      });
    }

    // Sirf bheje gaye fields update karna.
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(422).json({
          error: "Title cannot be empty",
        });
      }

      post.title = title.trim();
    }

    if (body !== undefined) {
      if (!body.trim()) {
        return res.status(422).json({
          error: "Caption cannot be empty",
        });
      }

      post.body = body.trim();
    }

    if (pic !== undefined) {
      if (!pic.trim()) {
        return res.status(422).json({
          error: "Photo URL cannot be empty",
        });
      }

      post.photo = pic;
    }

    await post.save();
    await post.populate("postedBy", "_id name pic");

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    console.error("Edit post error:", err);
    res.status(500).json({ error: "Unable to edit post" });
  }
});

// DELETE: Sirf apni post delete karna.
router.delete("/deletepost/:postId", requireLogin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Sirf owner apni post delete kar sakta hai.
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You are not authorized to delete this post",
      });
    }

    // IMPORTANT: Sirf current post delete hogi.
    await Post.deleteOne({ _id: post._id });

    res.json({
      message: "Post deleted successfully",
      _id: post._id,
    });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Unable to delete post" });
  }
});

module.exports = router;
