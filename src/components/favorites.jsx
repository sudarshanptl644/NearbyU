import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  ref,
  onValue,
  get,
  query,
  orderByChild,
  equalTo,
  remove,
} from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData =
    location.state?.studentData ||
    JSON.parse(localStorage.getItem("userSession"));

  const [favoriteShops, setFavoriteShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentDbKey, setStudentDbKey] = useState(null);

  useEffect(() => {
    if (!studentData) {
      navigate("/");
      return;
    }

    const fetchFavorites = async () => {
      const studentsRef = ref(db, "students");
      const q = query(
        studentsRef,
        orderByChild("email"),
        equalTo(studentData.email)
      );
      const studentSnap = await get(q);

      if (studentSnap.exists()) {
        const val = studentSnap.val();
        const key = Object.keys(val)[0];
        setStudentDbKey(key);

        const favIds = val[key].favorites || {};
        const favIdArray = Object.keys(favIds);

        if (favIdArray.length === 0) {
          setFavoriteShops([]);
          setLoading(false);
          return;
        }

        const shopsRef = ref(db, "shops");
        onValue(shopsRef, (shopSnap) => {
          const allShops = shopSnap.val();
          if (allShops) {
            const myFavs = favIdArray
              .map((id) => allShops[id])
              .filter((s) => s !== undefined);
            setFavoriteShops(myFavs);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [studentData, navigate]);

  const removeFavorite = async (e, shopId) => {
    e.stopPropagation();
    if (!studentDbKey) return;
    await remove(ref(db, `students/${studentDbKey}/favorites/${shopId}`));
    setFavoriteShops((prev) => prev.filter((s) => s.shopId !== shopId));
  };

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
          <h1>My Favorites</h1>
          <p>Shops you have saved for later.</p>
        </div>

        {loading ? (
          <p className="loading-text">Loading favorites...</p>
        ) : (
          <>
            {favoriteShops.length > 0 ? (
              <div className="shop-grid">
                {favoriteShops.map((shop) => (
                  <div
                    key={shop.shopId}
                    className="student-shop-card relative"
                    onClick={() =>
                      navigate("/shop-details", {
                        // FIX: Pass 'from' path here
                        state: { shop, studentData, from: "/favorites" },
                      })
                    }
                  >
                    <button
                      className="heart-btn"
                      onClick={(e) => removeFavorite(e, shop.shopId)}
                      title="Remove from Favorites"
                    >
                      <span className="heart-icon liked">❤️</span>
                    </button>

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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-favorites">
                <h2>No favorites yet! ❤️</h2>
                <p>
                  Explore the marketplace and click the heart icon to save shops
                  here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
