import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // or "../styles/VkLogin.css"
import vkImage from "../styles/vk.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const boxRef = useRef(null);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      navigate(user.isAdmin ? "/admin-dashboard" : "/user-home");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (!expanded) setExpanded(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("❌ Please fill out all fields.");
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        if (loggedInUser.isAdmin) {
          navigate("/admin/view-profile");
        } else {
          navigate("/view-profile");
        }
      } else {
        setError("❌ Invalid email or password.");
      }
    } catch (err) {
      setError("❌ Error during login.");
    }
  };

  return (
    <div
      ref={boxRef}
      className={`vk-box ${expanded ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
    >
      
<div className="vk-login">
        <div className="vk-loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i> Login{" "}
            <i className="fa-solid fa-heart"></i>
          </h2>
          {error && <div className="vk-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="vk-login-form" autoComplete="off">
            {/* Fake fields to block browser autofill */}
            <input
              type="text"
              name="fake-user"
              autoComplete="username"
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="fake-pass"
              autoComplete="current-password"
              style={{ display: "none" }}
            />

            <div className="vk-form-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="off"
              />
            </div>
            <div className="vk-form-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="vk-form-field">
              <button type="submit" className="vk-login-btn">
                Login
              </button>
            </div>
          </form>
          <div className="vk-group">
            <a href="/forgot-password">Forgot Password</a>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
