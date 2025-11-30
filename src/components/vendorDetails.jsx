import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
// UPDATED: Import 'set'
import { ref, push, set, onValue, get } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const VendorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shop = location.state?.shop;
  const currentUser = location.state?.studentData;

  // FIX: Dynamic Back Path
  const backPath = location.state?.from || "/student-home";
  const previousTab = location.state?.defaultTab;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [filterType, setFilterType] = useState("All");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If no shop data, show error
  if (!shop || (!shop.shopName && !shop.shopId)) {
    return (
      <div className="error-page">
        <h2>Shop not found</h2>
        <button onClick={() => navigate("/student-home")}>Go Home</button>
      </div>
    );
  }

  useEffect(() => {
    // Logic to fetch additional shop details if needed (omitted for brevity as it's in previous versions)
    if (!shop.shopName && shop.shopId) {
      // ... fetch code ...
    }
  }, [shop]);

  // ... (Review logic same as before) ...

  const handleSubmitReview = async (e) => {
    // ... (Review submit logic same as before) ...
  };

  const isRecent = (dateString) => {
    const reviewDate = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reviewDate > thirtyDaysAgo;
  };

  // Load reviews
  useEffect(() => {
    if (!shop.shopId) return;
    const reviewsRef = ref(db, `reviews/${shop.shopId}`);
    onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allReviews = Object.values(data);
        const recent = allReviews.filter((r) =>
          isRecent(r.timestamp || r.date)
        );
        setReviews(recent.reverse());
        if (currentUser && !currentUser.isVendor) {
          const userReview = recent.find(
            (r) => r.studentEmail === currentUser.email
          );
          setHasReviewed(!!userReview);
        }
      } else {
        setReviews([]);
        setHasReviewed(false);
      }
    });
  }, [shop.shopId, currentUser]);

  const filteredReviews = reviews.filter((review) => {
    if (filterType === "All") return true;
    if (filterType === "Positive") return review.rating >= 4;
    if (filterType === "Neutral") return review.rating === 3;
    if (filterType === "Negative") return review.rating <= 2;
    return true;
  });

  const displayedReviews =
    filterType === "All" && filteredReviews.length > 5
      ? filteredReviews.slice(0, 5)
      : filteredReviews;

  return (
    <div className="student-page">
      <Navbar userData={currentUser} />

      <div className="details-container">
        <button
          className="back-btn"
          onClick={() =>
            // FIX: Navigate back to dynamic path with state
            navigate(backPath, {
              state: {
                studentData: currentUser,
                defaultTab: previousTab,
              },
            })
          }
        >
          ← Back
        </button>

        {/* ... (Rest of UI for Header, Info, Menu, Reviews same as before) ... */}
        <div className="details-header">
          <img
            src={
              shop.shopImage ||
              "https://via.placeholder.com/800x400?text=No+Image"
            }
            alt={shop.shopName}
            className="details-hero-img"
          />
          <div className="details-overlay">
            <h1>{shop.shopName}</h1>
            <span className="details-badge">{shop.category}</span>
          </div>
        </div>

        <div className="details-content">
          <div className="left-col">
            <div className="details-info-card">
              <h2>About {shop.shopName}</h2>
              <div className="details-meta-grid">
                <div className="meta-item">
                  <strong>Owner</strong>
                  <p>{shop.ownerName}</p>
                </div>
                <div className="meta-item">
                  <strong>Status</strong>
                  <p
                    className={`status-pill ${
                      shop.status === "Closed" ? "status-closed" : "status-open"
                    }`}
                  >
                    {shop.status === "Closed" ? "Closed" : "Open Now"}
                  </p>
                </div>
                <div className="meta-item">
                  <strong>Specialty</strong>
                  <p>{shop.specialty || "N/A"}</p>
                </div>
                <div className="meta-item">
                  <strong>Services</strong>
                  <p>{shop.services || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="menu-section details-info-card">
              <h3>📜 Menu / Products</h3>
              {shop.products && shop.products.length > 0 ? (
                <div className="menu-grid">
                  {shop.products.map((item, index) => (
                    <div key={index} className="menu-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-menu">No products listed yet.</p>
              )}
            </div>
          </div>

          <div className="right-col">
            {/* ... (Reviews Section Code same as before) ... */}
            <div className="reviews-section details-info-card">
              <h2>Monthly Reviews ({reviews.length})</h2>
              {/* ... Filters ... */}
              <div
                className="review-filters"
                style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
              >
                {["All", "Positive", "Neutral", "Negative"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`review-filter-btn ${
                      filterType === type ? "active" : ""
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* ... Review Form or Login Prompt ... */}
              {/* ... Review List ... */}
              <div className="reviews-list">
                {displayedReviews.map((rev, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <strong>{rev.studentName}</strong>
                      <span className="review-date">{rev.date}</span>
                    </div>
                    <div className="review-stars">
                      {"⭐".repeat(rev.rating)}
                    </div>
                    <p className="review-text">{rev.text}</p>
                  </div>
                ))}
              </div>
              {filterType === "All" && filteredReviews.length > 5 && (
                <button
                  className="see-more-reviews-btn"
                  onClick={() => setShowAllReviewsModal(true)}
                >
                  See All Reviews
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Code */}
      {showAllReviewsModal && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setShowAllReviewsModal(false)}
        >
          <div
            className="reviews-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ... Modal Content ... */}
            <button
              className="close-modal-btn"
              onClick={() => setShowAllReviewsModal(false)}
            >
              ×
            </button>
            <div className="reviews-list">
              {filteredReviews.map((rev, i) => (
                <div key={i} className="review-card">
                  <strong>{rev.studentName}</strong>
                  <p>{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetails;
