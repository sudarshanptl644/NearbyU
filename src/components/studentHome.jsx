import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";
import "../CSS/darkMode.css";

const StudentHome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const studentData = location.state?.studentData;

  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const CATEGORIES = ["Food", "Stationery", "Services", "Retail"];

  useEffect(() => {
    if (!studentData) {
      navigate("/");
      return;
    }

    const shopsRef = ref(db, "shops");
    const unsubscribe = onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllShops(Object.values(data));
      } else {
        setAllShops([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [studentData, navigate]);

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

  const ShopCard = ({ shop }) => (
    <div
      className="student-shop-card"
      onClick={() =>
        navigate("/shop-details", { state: { shop, studentData } })
      }
    >
      <img
        src={
          shop.shopImage || "https://via.placeholder.com/300x200?text=No+Image"
        }
        alt={shop.shopName}
        className="shop-card-img"
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
                          // FIX: Passed studentData in state here
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
