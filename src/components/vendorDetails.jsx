import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
// UPDATED: Import 'set'
import { ref, push, set, onValue } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const VendorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shop = location.state?.shop;
  const currentUser = location.state?.studentData;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const [filterType, setFilterType] = useState("All");
  const [hasReviewed, setHasReviewed] = useState(false);

  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  // Helper to check if a date is within the last 30 days
  const isRecent = (dateString) => {
    const reviewDate = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reviewDate > thirtyDaysAgo;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!shop) {
    return (
      <div className="error-page">
        <h2>Shop not found</h2>
        <button onClick={() => navigate("/student-home")}>Go Home</button>
      </div>
    );
  }

  useEffect(() => {
    const reviewsRef = ref(db, `reviews/${shop.shopId}`);
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allReviews = Object.values(data);

        // Filter recent reviews
        const recentReviews = allReviews.filter((r) =>
          isRecent(r.timestamp || r.date)
        );

        setReviews(recentReviews.reverse());

        if (currentUser && !currentUser.isVendor) {
          const userReview = recentReviews.find(
            (r) => r.studentEmail === currentUser.email
          );
          setHasReviewed(!!userReview);
        }
      } else {
        setReviews([]);
        setHasReviewed(false);
      }
    });
    return () => unsubscribe();
  }, [shop.shopId, currentUser]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (hasReviewed) {
      alert("You have already reviewed this shop this month.");
      return;
    }

    if (!newReview.trim()) return;

    try {
      const now = new Date();
      // UPDATED: Create Custom Key (Name + Time Number)
      // Remove spaces/special chars from name for safety in key
      const safeName = currentUser.name
        .replace(/\s+/g, "_")
        .replace(/[.#$/[\]]/g, "");
      const timeNumber = now.getTime(); // Returns number like 16849234234
      const customKey = `${safeName}_${timeNumber}`;

      // Point directly to this custom key
      const specificReviewRef = ref(db, `reviews/${shop.shopId}/${customKey}`);

      await set(specificReviewRef, {
        reviewId: customKey,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        text: newReview,
        rating: rating,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: now.toISOString(),
      });

      setNewReview("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review", error);
      alert(
        `Failed to post review: ${error.message}. Please check your Firebase Database Rules.`
      );
    }
  };

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
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

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
            <div className="reviews-section details-info-card">
              <div
                className="reviews-header-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  Monthly Reviews ({reviews.length})
                </h2>
              </div>

              <div
                className="review-filters"
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
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

              {currentUser && !currentUser.isVendor ? (
                !hasReviewed ? (
                  <form onSubmit={handleSubmitReview} className="review-form">
                    <div className="rating-select">
                      <label>Rating:</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                        <option value="4">⭐⭐⭐⭐ Good</option>
                        <option value="3">⭐⭐⭐ Average</option>
                        <option value="2">⭐⭐ Poor</option>
                        <option value="1">⭐ Bad</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Write a review to become eligible for coins..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary">
                      Post Review
                    </button>
                  </form>
                ) : (
                  <div
                    className="login-prompt"
                    style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      borderColor: "#a7f3d0",
                    }}
                  >
                    <p>
                      ✅ You have reviewed this month. You are eligible for a
                      coin!
                    </p>
                  </div>
                )
              ) : (
                <div className="login-prompt">
                  {currentUser && currentUser.isVendor ? (
                    <p>
                      🚫 <strong>Vendor Preview Mode:</strong> You cannot submit
                      reviews.
                    </p>
                  ) : (
                    <p>🔒 Only verified students can write reviews.</p>
                  )}
                </div>
              )}

              <div className="reviews-list">
                {displayedReviews.length > 0 ? (
                  displayedReviews.map((rev, index) => (
                    <div key={index} className="review-card">
                      <div className="review-header">
                        <strong>{rev.studentName}</strong>
                        <span className="review-date">
                          {rev.date} {rev.time && `at ${rev.time}`}
                        </span>
                      </div>
                      <div className="review-stars">
                        {"⭐".repeat(rev.rating)}
                      </div>
                      <p className="review-text">{rev.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">No reviews for this month yet.</p>
                )}
              </div>

              {filterType === "All" && filteredReviews.length > 5 && (
                <button
                  className="see-more-reviews-btn"
                  onClick={() => setShowAllReviewsModal(true)}
                >
                  See All {filteredReviews.length} Reviews
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAllReviewsModal && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setShowAllReviewsModal(false)}
        >
          <div
            className="reviews-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>All Reviews ({filteredReviews.length})</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowAllReviewsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="reviews-list">
              {filteredReviews.map((rev, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <strong>{rev.studentName}</strong>
                    <span className="review-date">
                      {rev.date} {rev.time && `at ${rev.time}`}
                    </span>
                  </div>
                  <div className="review-stars">{"⭐".repeat(rev.rating)}</div>
                  <p className="review-text">{rev.text}</p>
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
