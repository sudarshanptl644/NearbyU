import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
// Realtime Database Imports
import {
  ref,
  onValue,
  remove,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";
import "../CSS/darkMode.css";

const StudentHome = () => {
  // ... existing state and useEffects ...
  const navigate = useNavigate();
  const location = useLocation();

  const studentData =
    location.state?.studentData ||
    JSON.parse(localStorage.getItem("userSession"));

  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [favorites, setFavorites] = useState({});
  const [userDbKey, setUserDbKey] = useState(studentData?.key || null);

  const CATEGORIES = ["Food", "Stationery", "Services", "Retail"];

  useEffect(() => {
    if (!studentData) {
      navigate("/");
      return;
    }

    const shopsRef = ref(db, "shops");
    const unsubscribeShops = onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllShops(Object.values(data));
      } else {
        setAllShops([]);
      }
      setLoading(false);
    });

    const setupFavoritesListener = (key) => {
      if (!key) return;
      const favRef = ref(db, `students/${key}/favorites`);
      onValue(favRef, (favSnap) => {
        setFavorites(favSnap.val() || {});
      });
    };

    if (userDbKey) {
      setupFavoritesListener(userDbKey);
    } else {
      const studentsRef = ref(db, "students");
      const q = query(
        studentsRef,
        orderByChild("email"),
        equalTo(studentData.email)
      );

      get(q).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const key = Object.keys(val)[0];
          setUserDbKey(key);
          const updatedSession = { ...studentData, key: key };
          localStorage.setItem("userSession", JSON.stringify(updatedSession));
          setupFavoritesListener(key);
        }
      });
    }

    return () => unsubscribeShops();
  }, [studentData, navigate, userDbKey]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      const matches = allShops.filter((shop) =>
        shop.shopName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (shopName) => {
    setSearchTerm(shopName);
    setSuggestions([]);
  };

  const toggleFavorite = async (e, shopId) => {
    e.stopPropagation();
    e.preventDefault();

    const activeKey = userDbKey || studentData?.key;

    if (!activeKey) {
      return;
    }

    const favItemRef = ref(db, `students/${activeKey}/favorites/${shopId}`);

    try {
      if (favorites[shopId]) {
        await remove(favItemRef);
      } else {
        await set(favItemRef, true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCardClick = (shop) => {
    navigate("/shop-details", {
      state: { shop, studentData, from: "/student-home" },
    });
  };

  const ShopCard = ({ shop }) => {
    const isLiked = !!favorites[shop.shopId];

    return (
      <div
        className="student-shop-card relative"
        onClick={() => handleCardClick(shop)}
      >
        <button
          className="heart-btn"
          onClick={(e) => toggleFavorite(e, shop.shopId)}
          title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
          style={{ zIndex: 50 }}
        >
          <span className={`heart-icon ${isLiked ? "liked" : ""}`}>
            {isLiked ? "❤️" : "🤍"}
          </span>
        </button>

        {/* UPDATED: Image with Error Handling */}
        <img
          src={
            shop.shopImage || "https://via.placeholder.com/300x200?text=Shop"
          }
          alt={shop.shopName}
          className="shop-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />

        <div className="shop-card-info">
          <div className="shop-header-row">
            <h3>{shop.shopName}</h3>
            <span className="shop-badge">{shop.category}</span>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <span
              className={`status-pill ${
                shop.status === "Closed" ? "status-closed" : "status-open"
              }`}
              style={{ fontSize: "0.75rem" }}
            >
              {shop.status === "Closed" ? "🔴 Closed" : "🟢 Open"}
            </span>
          </div>

          <p className="shop-owner">Owner: {shop.ownerName}</p>

          <p
            style={{
              fontSize: "0.8rem",
              color: "#999",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            Click card to view full details...
          </p>
        </div>
      </div>
    );
  };

  if (!studentData) return null;

  return (
    <div className="student-page">
      <Navbar userData={studentData} />

      <div className="main-content">
        <div className="hero-section">
          <h1>Welcome, {studentData?.name || "Student"}</h1>
          <div className="search-wrapper">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              />
              <button className="search-btn">🔍</button>
            </div>
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((shop) => (
                  <div
                    key={shop.shopId}
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionClick(shop.shopName)}
                  >
                    <span className="suggestion-name">{shop.shopName}</span>
                    <span className="suggestion-cat">{shop.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            {searchTerm ? (
              <div className="search-results-view">
                <h2>Search Results</h2>
                <div className="shop-grid">
                  {allShops
                    .filter((s) =>
                      s.shopName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((shop) => (
                      <ShopCard key={shop.shopId} shop={shop} />
                    ))}
                </div>
              </div>
            ) : (
              <div className="category-sections-view">
                {CATEGORIES.map((category) => {
                  const shopsInCat = allShops.filter(
                    (shop) => shop.category === category
                  );
                  if (shopsInCat.length === 0) return null;

                  return (
                    <div key={category} className="category-section">
                      <div className="section-header">
                        <h2>{category}</h2>
                        {shopsInCat.length > 4 && (
                          <span
                            className="see-more-link"
                            onClick={() =>
                              navigate(`/category/${category}`, {
                                state: { studentData },
                              })
                            }
                          >
                            See More →
                          </span>
                        )}
                      </div>
                      <div className="shop-grid">
                        {shopsInCat.slice(0, 4).map((shop) => (
                          <ShopCard key={shop.shopId} shop={shop} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
