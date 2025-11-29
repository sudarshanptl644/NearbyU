import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/student.css";
import "../CSS/darkMode.css";

const Navbar = ({ userData }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check LocalStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <nav className="student-navbar">
      {/* LEFT: Logo */}
      <div
        className="nav-logo"
        onClick={() =>
          navigate("/student-home", { state: { studentData: userData } })
        }
      >
        <img src="/logo.png" alt="nearbyU" className="nav-logo-img" />
      </div>

      {/* CENTER: Navigation Links */}
      <div className="nav-links">
        {/* REMOVED: Vendor Portal Button (as requested) */}

        <span
          onClick={() =>
            navigate("/student-home", { state: { studentData: userData } })
          }
        >
          Home
        </span>
        <span>My Orders</span>
        <span>Favorites</span>

        <span
          onClick={() => navigate("/profile", { state: { userData } })}
          className="profile-link"
        >
          Profile
        </span>
      </div>

      {/* RIGHT: Theme Toggle & Logout */}
      <div className="nav-right">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <button className="nav-logout" onClick={() => navigate("/")}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
