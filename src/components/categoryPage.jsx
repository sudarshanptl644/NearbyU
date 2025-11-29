import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const studentData = location.state?.studentData;

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Scroll to top when this page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!studentData) {
      navigate("/");
    }
  }, [studentData, navigate]);

  useEffect(() => {
    const shopsRef = ref(db, "shops");

    const unsubscribe = onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allShops = Object.values(data);
        const filtered = allShops.filter(
          (shop) => shop.category === categoryName
        );
        setShops(filtered);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryName]);

  if (!studentData) return null;

  return (
    <div className="student-page">
      <Navbar userData={studentData} />

      <div className="main-content">
        <button
          className="back-btn"
          onClick={() => navigate("/student-home", { state: { studentData } })}
        >
          ← Back to Home
        </button>

        <div className="category-header-large">
          <h1>{categoryName}</h1>
          <p>
            Exploring all {shops.length} shops in {categoryName}
          </p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="shop-grid">
            {shops.length > 0 ? (
              shops.map((shop) => (
                <div
                  key={shop.shopId}
                  className="student-shop-card"
                  onClick={() =>
                    navigate("/shop-details", { state: { shop, studentData } })
                  }
                >
                  <img
                    src={
                      shop.shopImage ||
                      "https://via.placeholder.com/300x200?text=No+Image"
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
                          shop.status === "Closed"
                            ? "status-closed"
                            : "status-open"
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
              ))
            ) : (
              <div className="no-results">
                <h3>No shops found in this category yet.</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
