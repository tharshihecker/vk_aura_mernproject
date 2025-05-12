import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import vkImage from "../styles/vk.jpg";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    sex: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });
  const [expanded, setExpanded] = useState(false);

  const navigate = useNavigate();
  const messageRef = useRef(null);
  const boxRef = useRef(null);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
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

  const checkEmail = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/check-email", {
        email: formData.email,
      });

      if (res.data.exists) {
        setError("❌ Email already registered. Please login.");
        setLoading(false);
      } else {
        setError("");
        setMessage("🔄 Sending OTP...");
        sendOTP();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error checking email.");
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/send-otp", { email: formData.email });
      setMessage("✅ OTP sent to your email!");
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtpLoading(true);
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:5000/api/users/send-otp", { email: formData.email });
      setMessage("✅ OTP resent to your email!");
      setOtpLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    setMessage("");
    setError("");

    try {
      await axios.post("http://localhost:5000/api/users/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      setMessage("✅ OTP Verified!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Invalid OTP.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    scrollToMessage();
    setMessage("");
    setError("");

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("❌ Phone number must be 10 digits and start with 0.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("❌ Password does not meet all security requirements.");
      return;
    }
    if (!formData.sex) {
      setError("❌ Please select your gender.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        ...formData,
        phone: formData.phone,
      });
      setMessage(res.data.message);
      scrollToMessage();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  const scrollToMessage = () => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={`signup-box ${expanded ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      ref={boxRef}
    >
      <div className="signup">
        
        <div className="signupBx">
          <h2>Signup</h2>
          <div ref={messageRef}>
            {message && <p className="message-success">{message}</p>}
            {error && <p className="message error">{error}</p>}
          </div>

          {step === 1 && (
            <div className="step-container">
              {/* Autofill prevention fields */}
              <input type="text" name="fake-user" autoComplete="username" style={{ display: "none" }} />
              <input type="password" name="fake-pass" autoComplete="current-password" style={{ display: "none" }} />

              <input
                className="input-field"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="off"
              />
              <button className="btn" type="button" onClick={checkEmail} disabled={loading}>
                {loading ? "Checking..." : "Next"}
              </button>
              <p>
                Already a user? <a href="/login">Login here</a>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="step-container">
              <input
                className="input-field"
                type="number"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <button className="btn" type="button" onClick={verifyOTP}>
                Verify OTP
              </button>
              <button className="btn resend-otp" type="button" onClick={resendOTP} disabled={otpLoading}>
                {otpLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          )}

          {step === 3 && (
            <form className="registration-form" onSubmit={handleRegister} autoComplete="off">
              <input
                className="input-field"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <input
                className="input-field"
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                inputMode="numeric"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (!/^\d$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <input
                className="input-field"
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <div className="gender-container">
                <div className="gender-radio-group">
                  <label className="gender-label">Sex:</label>
                  <label>
                    <input
                      type="radio"
                      name="sex"
                      value="Male"
                      onChange={handleChange}
                      required
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sex"
                      value="Female"
                      onChange={handleChange}
                      required
                    />
                    Female
                  </label>
                </div>
              </div>

              <input
                className="input-field"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <div className="password-criteria">
                <p>{passwordCriteria.length ? "✅" : "❌"} At least 8 characters</p>
                <p>{passwordCriteria.number ? "✅" : "❌"} At least 1 number (0-9)</p>
                <p>{passwordCriteria.lowercase ? "✅" : "❌"} At least 1 lowercase letter (a-z)</p>
                <p>{passwordCriteria.uppercase ? "✅" : "❌"} At least 1 uppercase letter (A-Z)</p>
                <p>{passwordCriteria.specialChar ? "✅" : "❌"} At least 1 special symbol (!@#$%^&*)</p>
              </div>
              <input
                className="input-field"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button className="btn" type="submit">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
