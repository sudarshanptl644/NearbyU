import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
// UPDATED: Import 'set' and 'ref' explicitly
import { ref, set, get, child } from "firebase/database";
import "../CSS/login.css";

const VendorRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Security: Check if user came from Payment Page
  useEffect(() => {
    if (!location.state?.paymentSuccess) {
      alert("Please purchase a plan first.");
      navigate("/subscription");
    }
  }, [location, navigate]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    storeName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Basic Validation for username (no spaces or special chars allowed for keys)
    const cleanUsername = formData.username.trim().replace(/[.#$/[\]]/g, "");
    if (cleanUsername !== formData.username) {
      alert(
        "Username cannot contain spaces or special characters like . # $ [ ]"
      );
      setLoading(false);
      return;
    }

    try {
      // 1. Check if username already exists by trying to fetch that exact path
      // This is much faster than a query!
      const userRef = ref(db, "vendors/" + cleanUsername);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        alert("Username already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // 2. Create new Vendor Account with Custom Key (Username)
      await set(userRef, {
        username: cleanUsername,
        password: formData.password,
        storeName: formData.storeName,
        plan: "Premium",
        joinedAt: new Date().toISOString(),
      });

      alert("Registration Successful! Please Login.");
      navigate("/");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Failed to register. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="header">Create Account</h2>
        <p className="sub-header">Step 2: Setup your credentials</p>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label className="input-label">Choose Username</label>
            <input
              name="username"
              type="text"
              required
              placeholder="e.g. canteen_admin"
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Store Name (For Reference)</label>
            <input
              name="storeName"
              type="text"
              required
              placeholder="e.g. University Canteen"
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="******"
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="******"
              onChange={handleChange}
              className="login-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;
