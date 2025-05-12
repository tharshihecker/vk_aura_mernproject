import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const messageRef = useRef(null);
  const boxRef = useRef(null);

  const scrollToMessage = () => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "newPassword") {
      validatePassword(e.target.value);
    }
  };

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const checkForgotPasswordEmail = async () => {
    if (!formData.email) return setError("❌ Please enter an email.");
    setMessage(""); setError(""); setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/check-forgot-password-email",
        { email: formData.email }
      );
      if (res.data.exists) {
        await sendForgotPasswordOTP();
      } else {
        setError("❌ Email not found. Please register first.");
        scrollToMessage();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error checking email.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  const sendForgotPasswordOTP = async () => {
    setMessage(""); setError(""); setLoading(true);
    setIsResendDisabled(true);
    try {
      await axios.post(
        "http://localhost:5000/api/users/send-forgot-password-otp",
        { email: formData.email }
      );
      setMessage("✅ OTP sent to your email!");
      setStep(2);
      scrollToMessage();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      scrollToMessage();
    } finally {
      setLoading(false);
      setIsResendDisabled(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp) return setError("❌ Please enter OTP.");
    setMessage(""); setError(""); setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      setMessage("✅ OTP Verified!");
      setStep(3);
      scrollToMessage();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Invalid OTP.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    scrollToMessage();
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("❌ Please fill in both password fields.");
      scrollToMessage();
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("❌ Passwords do not match.");
      scrollToMessage();
      return;
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("❌ Password does not meet all security requirements.");
      scrollToMessage();
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/request-forgot-password",
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );
      setMessage(res.data.message);
      scrollToMessage();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to reset password.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div
      className={`vkfp-container ${expanded ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      ref={boxRef}
    >
      <div className="vkfp-content">
        <div className="vkfp-box">
          <h2>Forgot Password</h2>

          <div ref={messageRef}>
            {message && <p className="vk-success-message">{message}</p>}
            {error && <p className="vk-error-message">{error}</p>}
          </div>

          {step === 1 && (
            <>
              {/* Autofill prevention fields */}
              <input type="text" name="fake-user" autoComplete="username" style={{ display: "none" }} />
              <input type="password" name="fake-pass" autoComplete="current-password" style={{ display: "none" }} />

              <input
                type="email"
                name="email"
                className="vkfp-input-field"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="vkfp-btn"
                onClick={checkForgotPasswordEmail}
                disabled={loading}
              >
                {loading ? "Checking..." : "Next"}
              </button>
              <p className="vkfp-step-container">
                Don't have an account? <a href="/signup">Signup</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="number"
                name="otp"
                className="vkfp-input-field"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="vkfp-btn"
                onClick={verifyOTP}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                className="vkfp-btn vkfp-resend-otp-btn"
                onClick={sendForgotPasswordOTP}
                disabled={isResendDisabled || loading}
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </>
          )}

          {step === 3 && (
            <form className="vkfp-registration-form" onSubmit={handleReset} autoComplete="off">
              <input
                type="password"
                name="newPassword"
                className="vkfp-input-field"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <div className="vkfp-password-criteria">
                <p>{passwordCriteria.length ? "✅" : "❌"} At least 8 characters</p>
                <p>{passwordCriteria.number ? "✅" : "❌"} At least 1 number (0–9)</p>
                <p>{passwordCriteria.lowercase ? "✅" : "❌"} At least 1 lowercase letter (a–z)</p>
                <p>{passwordCriteria.uppercase ? "✅" : "❌"} At least 1 uppercase letter (A–Z)</p>
                <p>{passwordCriteria.specialChar ? "✅" : "❌"} At least 1 special symbol (!@#$%^&*)</p>
              </div>
              <input
                type="password"
                name="confirmPassword"
                className="vkfp-input-field"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="submit" className="vkfp-btn" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
