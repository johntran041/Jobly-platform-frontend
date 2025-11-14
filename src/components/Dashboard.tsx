// src/components/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate with router for routing

// Interface for POST - make sure returning object for 'Post' is returning the correct type
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  reactions: {
    likes: number;
    dislikes: number;
  };
}

// Interface for ValidateUser - make sure returning object for 'ValidateUser' is returning the correct type

interface ValidateUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  refreshToken?: string;
}


interface DashboardProps {
  user: ValidateUser;
  onLogout: () => void;
}

// sanitize input string 
function sanitizeString(str: string): string {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function validatePost(post: any): Post | null {
  if (!post || typeof post !== "object") {
    return null;
  }
  if (typeof post.id !== "number") return null;
  if (!post.title || typeof post.title !== "string") return null;
  if (!post.body || typeof post.body !== "string") return null;

  return {
    id: post.id,
    title: sanitizeString(String(post.title).trim()),
    body: sanitizeString(String(post.body).trim()),
    userId: Number(post.userId) || 0,
    reactions: {
      likes: Number(post.reactions?.likes) || 0,
      dislikes: Number(post.reactions?.dislikes) || 0,
    },
  };
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  // TODO: Add navigate hook
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

  useEffect(() => {
    setLoadingPosts(true);
    fetch(`https://dummyjson.com/posts/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const validatedPosts = (data.posts || [])
          .map(validatePost)
          .filter((post: Post | null): post is Post => post !== null);
        setPosts(validatedPosts);
        setLoadingPosts(false);
      })
      .catch(() => {
        setLoadingPosts(false);
      });
  }, [user.id]);

  return (
    <div className="container mt-5">
      {/* TODO: Add Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">👤 My Dashboard</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/products")}
            >
              🛍️ Products
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-body text-center">
          <h2 className="card-title mb-4">My Profile</h2>

          <img
            src={user.image}
            alt={user.username}
            className="rounded-circle mb-3"
            style={{ width: "120px", height: "120px" }}
          />
          <h3>
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-muted">@{user.username}</p>
          <p>📧 {user.email}</p>
          <p>👤 {user.gender}</p>
          <p>🆔 {user.id}</p>

          <hr className="my-4" />

          <h4 className="mb-3">My Posts</h4>
          {loadingPosts && <p>Loading posts...</p>}
          {posts.length === 0 && !loadingPosts && (
            <p className="text-muted">No posts yet</p>
          )}
          {posts.map((post) => (
            <div key={post.id} className="card mb-3 text-start">
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.body.substring(0, 100)}...</p>
                <div className="d-flex gap-3">
                  <small className="text-muted">
                    👍 {post.reactions.likes}
                  </small>
                  <small className="text-muted">
                    👎 {post.reactions.dislikes}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
