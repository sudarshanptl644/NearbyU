import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import "../CSS/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("student");
  const [email, setEmail] = useState("");
  const [vendorUser, setVendorUser] = useState("");
  const [vendorPass, setVendorPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const studentsRef = ref(db, "students");
      const studentQuery = query(
        studentsRef,
        orderByChild("email"),
        equalTo(email)
      );
      const snapshot = await get(studentQuery);

      if (snapshot.exists()) {
        const val = snapshot.val();
        const studentKey = Object.keys(val)[0];
        const studentData = val[studentKey];

        setVerified(true);
        setLoading(false);

        setTimeout(() => {
          navigate("/student-home", { state: { studentData } });
        }, 1500);
      } else {
        setError("Register your university email to the university database.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Firebase Error:", err);
      setError(`Login Failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Verify Vendor Credentials
      const vendorsRef = ref(db, "vendors");
      const vendorQuery = query(
        vendorsRef,
        orderByChild("username"),
        equalTo(vendorUser)
      );
      const snapshot = await get(vendorQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const vendorKey = Object.keys(data)[0];
        const vendorData = data[vendorKey];

        if (vendorData.password === vendorPass) {
          // 2. CHECK: Does this Vendor have a Shop?
          const shopsRef = ref(db, "shops");
          const shopQuery = query(
            shopsRef,
            orderByChild("vendorUsername"),
            equalTo(vendorUser)
          );
          const shopSnapshot = await get(shopQuery);

          if (shopSnapshot.exists()) {
            // CASE A: REGISTERED -> Go to Main App (Student Dashboard)
            console.log("Shop found, redirecting to Main App...");
            navigate("/student-home", {
              state: {
                studentData: {
                  name: vendorData.username + " (Vendor View)",
                  email: "vendor_preview@nearbyu.com",
                  isVendor: true,
                  originalVendorData: vendorData,
                },
              },
            });
          } else {
            // CASE B: NOT REGISTERED -> Go to Vendor Portal
            console.log("No shop found, redirecting to Vendor Dashboard...");
            navigate("/vendor-dashboard", { state: { vendorData } });
          }
        } else {
          setError("Incorrect password.");
        }
      } else {
        setError("Vendor username not found.");
      }
    } catch (err) {
      console.error("Firebase Error:", err);
      setError(`Login Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`login-card ${userType === "vendor" ? "wide-card" : ""}`}>
        <div className="login-logo-container">
          <img src="/logo.png" alt="nearbyU" className="login-logo-img" />
        </div>

        <p className="sub-header">Welcome back!</p>

        <div className="toggle-group">
          <button
            className={userType === "student" ? "active-tab" : "tab"}
            onClick={() => {
              setUserType("student");
              setError("");
              setVerified(false);
            }}
          >
            Student
          </button>
          <button
            className={userType === "vendor" ? "active-tab" : "tab"}
            onClick={() => {
              setUserType("vendor");
              setError("");
            }}
          >
            Vendor
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {userType === "student" ? (
          <form onSubmit={handleStudentLogin} className="login-form">
            <div className="input-group">
              <label className="input-label">University Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`login-input ${
                    verified ? "verified-success" : ""
                  }`}
                  disabled={verified || loading}
                />
                {verified && <div className="verified-tick">✓</div>}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || verified}
              className={`btn-primary ${verified ? "success-btn" : ""}`}
            >
              {verified
                ? "Verified! Redirecting..."
                : loading
                ? "Verifying..."
                : "Login as Student"}
            </button>
          </form>
        ) : (
          <div className="vendor-split-layout">
            <div className="vendor-login-side">
              <h3>Vendor Login</h3>
              <form onSubmit={handleVendorLogin} className="login-form">
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      value={vendorUser}
                      onChange={(e) => setVendorUser(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={vendorPass}
                      onChange={(e) => setVendorPass(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Checking..." : "Login to Dashboard"}
                </button>
              </form>
            </div>

            <div className="vendor-register-side">
              <div className="direct-plan-card">
                <div className="plan-badge">Best Value</div>
                <h3>Vendor Premium</h3>
                <div className="direct-price">
                  <span className="cur">₹</span>
                  <span className="amt">100</span>
                  <span className="per">/mo</span>
                </div>

                <ul className="direct-features">
                  <li>✔ List Your Shop</li>
                  <li>✔ Manage Products</li>
                  <li>✔ Verified Badge</li>
                </ul>

                <button
                  onClick={() => navigate("/payment-selection")}
                  className="subscribe-btn"
                >
                  Pay & Register Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
