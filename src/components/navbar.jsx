import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/student.css";
import "../CSS/darkMode.css";
// We don't import css here because it's imported in the parent pages usually,
// but for safety in this environment we can leave it out or include if needed.
// The error was about Marketplace importing Navbar.

const Navbar = ({ userData }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

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
        <span
          onClick={() =>
            navigate("/student-home", { state: { studentData: userData } })
          }
        >
          Home
        </span>

        <span
          onClick={() =>
            navigate("/marketplace", { state: { studentData: userData } })
          }
        >
          Marketplace
        </span>

        {/* UPDATED LINK */}
        <span
          onClick={() =>
            navigate("/favorites", { state: { studentData: userData } })
          }
        >
          Favorites
        </span>

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
