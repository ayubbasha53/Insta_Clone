import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import M from "materialize-css";
import { Usercontext } from "../../App";

export default function Home() {
  const { state } = useContext(Usercontext);

  const [data, setData] = useState([]);
  const [comment, setComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyPost, setBusyPost] = useState("");

  const token = localStorage.getItem("jwt");

  // Backend se sabhi posts load karna.
  async function fetchPosts() {
    try {
      setError("");

      const response = await fetch("/allpost", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Unable to load posts",
        );
      }

      setData(Array.isArray(result.posts) ? result.posts : []);
    } catch (err) {
      setError(err.message || "Unable to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // Post ko like ya unlike karna.
  async function likePost(postId, alreadyLiked) {
    try {
      setBusyPost(postId);

      const response = await fetch(alreadyLiked ? "/unlike" : "/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          postId: postId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Like action failed");
      }

      await fetchPosts();
    } catch (err) {
      M.toast({ html: err.message || "Unable to update like" });
    } finally {
      setBusyPost("");
    }
  }

  // Comment ko backend par save karna.
  async function makeComment(text, postId) {
    const value = (text || "").trim();

    if (!value) {
      M.toast({ html: "Please enter a comment" });
      return;
    }

    try {
      setBusyPost(postId);

      const response = await fetch("/comment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          text: value,
          postId: postId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Comment failed");
      }

      setComment((previous) => ({
        ...previous,
        [postId]: "",
      }));

      await fetchPosts();
    } catch (err) {
      M.toast({ html: err.message || "Unable to add comment" });
    } finally {
      setBusyPost("");
    }
  }

  // Apni post delete karna.
  async function deletePost(postId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyPost(postId);

      const response = await fetch("/deletepost/" + postId, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Delete failed");
      }

      setData((previous) => previous.filter((post) => post._id !== postId));

      M.toast({ html: "Post deleted successfully" });
    } catch (err) {
      M.toast({ html: err.message || "Unable to delete post" });
    } finally {
      setBusyPost("");
    }
  }

  // Logged-in user ki ID compare karna.
  const currentUserId = state ? state._id : "";

  return (
    <main className="instagram-feed-page">
      <section className="instagram-feed">
        {/* Stories-style preview row */}
        <div className="stories-panel">
          <div className="stories-heading">
            <h2>Stories</h2>
            <span>Preview</span>
          </div>

          <div className="stories-list">
            <div className="story-item">
              <div className="story-ring story-own">
                <div className="story-avatar">+</div>
              </div>
              <span>Your story</span>
            </div>

            {data
              .filter((post) => post.postedBy)
              .filter(
                (post, index, posts) =>
                  posts.findIndex(
                    (item) => item.postedBy._id === post.postedBy._id,
                  ) === index,
              )
              .slice(0, 7)
              .map((post) => (
                <Link
                  to={"/profile/" + post.postedBy._id}
                  className="story-item"
                  key={post.postedBy._id}
                >
                  <div className="story-ring">
                    <div className="story-avatar">
                      {post.postedBy.name
                        ? post.postedBy.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  </div>

                  <span>{post.postedBy.name || "User"}</span>
                </Link>
              ))}
          </div>
        </div>

        {/* Feed heading */}
        <div className="feed-heading">
          <div>
            <h1>Home</h1>
            <p>Discover what people are sharing.</p>
          </div>

          <Link to="/create" className="feed-create-button">
            + Create
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="feed-message">
            <div className="feed-spinner"></div>
            <p>Loading posts...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="feed-message feed-error">
            <p>{error}</p>
            <button onClick={fetchPosts}>Try again</button>
          </div>
        )}

        {/* Empty feed */}
        {!loading && !error && data.length === 0 && (
          <div className="feed-empty">
            <div className="empty-icon">◎</div>
            <h2>No posts yet</h2>
            <p>Be the first to share something with your community.</p>
            <Link to="/create" className="feed-create-button">
              Create your first post
            </Link>
          </div>
        )}

        {/* Posts */}
        {!loading &&
          !error &&
          data.map((item) => {
            const postId = item._id;
            const author = item.postedBy || {};
            const likes = Array.isArray(item.likes) ? item.likes : [];

            const alreadyLiked = likes.some(
              (like) =>
                String(
                  typeof like === "object" && like !== null ? like._id : like,
                ) === String(currentUserId),
            );

            const isOwner = String(author._id) === String(currentUserId);

            return (
              <article className="instagram-post" key={postId}>
                {/* Post author */}
                <div className="post-header">
                  <Link
                    to={isOwner ? "/profile" : "/profile/" + author._id}
                    className="post-author"
                  >
                    {author.pic ? (
                      <img
                        src={author.pic}
                        alt={author.name || "User"}
                        className="post-avatar"
                      />
                    ) : (
                      <div className="post-avatar post-avatar-fallback">
                        {author.name
                          ? author.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}

                    <div className="post-author-info">
                      <span className="post-author-name">
                        {author.name || "Unknown user"}
                      </span>
                      <span className="post-author-subtitle">
                        Shared a post
                      </span>
                    </div>
                  </Link>

                  {isOwner && (
                    <button
                      className="post-more-button"
                      onClick={() => deletePost(postId)}
                      disabled={busyPost === postId}
                      title="Delete post"
                      aria-label="Delete post"
                    >
                      {busyPost === postId ? "..." : "•••"}
                    </button>
                  )}
                </div>

                {/* Main post image */}
                {item.photo && (
                  <div className="post-image-container">
                    <img
                      src={item.photo}
                      alt={item.title || "Post"}
                      className="post-main-image"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Like and comment actions */}
                <div className="post-actions">
                  <div className="post-actions-left">
                    <button
                      className={
                        alreadyLiked
                          ? "post-action-button liked"
                          : "post-action-button"
                      }
                      onClick={() => likePost(postId, alreadyLiked)}
                      disabled={busyPost === postId}
                      aria-label={alreadyLiked ? "Unlike post" : "Like post"}
                      title={alreadyLiked ? "Unlike" : "Like"}
                    >
                      {alreadyLiked ? "♥" : "♡"}
                    </button>

                    <a
                      href={"#comment-" + postId}
                      className="post-action-button"
                      aria-label="View comments"
                    >
                      ♧
                    </a>

                    <button
                      className="post-action-button"
                      onClick={() =>
                        M.toast({ html: "Share feature will be added next" })
                      }
                      aria-label="Share post"
                      title="Share"
                    >
                      ↗
                    </button>
                  </div>
                </div>

                {/* Like count */}
                <div className="post-like-count">
                  {likes.length} {likes.length === 1 ? "like" : "likes"}
                </div>

                {/* Caption */}
                {(item.title || item.body) && (
                  <div className="post-caption">
                    <Link
                      to={isOwner ? "/profile" : "/profile/" + author._id}
                      className="caption-author"
                    >
                      {author.name || "User"}
                    </Link>

                    {item.title && (
                      <span className="caption-title">{" " + item.title}</span>
                    )}

                    {item.body && <p className="caption-body">{item.body}</p>}
                  </div>
                )}

                {/* Comments */}
                <div className="post-comments" id={"comment-" + postId}>
                  {Array.isArray(item.comments) &&
                    item.comments.map((entry, index) => (
                      <div className="post-comment" key={entry._id || index}>
                        <span className="comment-author">
                          {entry.postedBy ? entry.postedBy.name : "User"}
                        </span>

                        <span className="comment-text">
                          {" " + (entry.text || "")}
                        </span>
                      </div>
                    ))}

                  {(!item.comments || item.comments.length === 0) && (
                    <p className="no-comments">No comments yet.</p>
                  )}
                </div>

                {/* Add comment */}
                <form
                  className="post-comment-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    makeComment(comment[postId], postId);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment[postId] || ""}
                    onChange={(event) =>
                      setComment((previous) => ({
                        ...previous,
                        [postId]: event.target.value,
                      }))
                    }
                    aria-label="Write a comment"
                  />

                  <button
                    type="submit"
                    disabled={
                      busyPost === postId || !(comment[postId] || "").trim()
                    }
                  >
                    Post
                  </button>
                </form>
              </article>
            );
          })}
      </section>

      {/* Desktop right panel */}
      <aside className="feed-right-panel">
        <div className="suggestions-card">
          <h3>Community</h3>
          <p>Discover posts and connect with people.</p>
          <Link to="/myfollowerspost">View following feed →</Link>
        </div>

        <div className="feed-footer">
          <span>About</span>
          <span>Help</span>
          <span>Privacy</span>
          <p>InstaConnect · Social community</p>
        </div>
      </aside>
    </main>
  );
}
