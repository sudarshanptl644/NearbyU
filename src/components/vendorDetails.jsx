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

  const backPath = location.state?.from || "/student-home";
  const previousTab = location.state?.defaultTab;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const [filterType, setFilterType] = useState("All");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  // Helper: Check if date is within last 30 days
  const isRecent = (dateString) => {
    if (!dateString) return false;
    const reviewDate = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reviewDate > thirtyDaysAgo;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch shop if missing (from ID)
  useEffect(() => {
    if (shop?.shopId && !shop.shopName) {
      const fetchShop = async () => {
        try {
          const snapshot = await get(ref(db, `shops/${shop.shopId}`));
          if (snapshot.exists()) {
            setShop(snapshot.val());
          }
        } catch (err) {
          console.error("Error fetching shop:", err);
        }
      };
      fetchShop();
    }
  }, [shop]);

  if (!shop || (!shop.shopName && !shop.shopId)) {
    return (
      <div className="error-page">
        <h2>Shop not found</h2>
        <button onClick={() => navigate("/student-home")}>Go Home</button>
      </div>
    );
  }

  useEffect(() => {
    if (!shop.shopId) return;

    const reviewsRef = ref(db, `reviews/${shop.shopId}`);
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allReviews = Object.values(data);

        // FILTER: Only show reviews from the last 30 days
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
      const safeName = currentUser.name
        .replace(/\s+/g, "_")
        .replace(/[.#$/[\]]/g, "");
      const timeNumber = now.getTime();
      const customKey = `${safeName}_${timeNumber}`;

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
      alert(`Failed to post review: ${error.message}`);
    }
  };

  // 1. Filter based on selection
  const filteredReviews = reviews.filter((review) => {
    if (filterType === "All") return true;
    if (filterType === "Positive") return review.rating >= 4;
    if (filterType === "Neutral") return review.rating === 3;
    if (filterType === "Negative") return review.rating <= 2;
    return true;
  });

  // 2. UPDATED: Truncate list to 5 items regardless of filter type
  const displayedReviews =
    filteredReviews.length > 5 ? filteredReviews.slice(0, 5) : filteredReviews;

  const StarDisplay = ({ count }) => (
    <div className="star-display">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < count ? "star filled" : "star empty"}>
          ★
        </span>
      ))}
    </div>
  );

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  return (
    <div className="student-page">
      <Navbar userData={currentUser} />

      <div className="details-container">
        <button
          className="back-btn"
          onClick={() =>
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
                <div className="meta-item" style={{ gridColumn: "span 2" }}>
                  <strong>Location</strong>
                  <p>{shop.address || "On Campus"}</p>
                </div>
              </div>
            </div>

            <div className="menu-section details-info-card">
              <h3>📜 Menu / Products</h3>
              {shop.products && shop.products.length > 0 ? (
                <div className="menu-grid">
                  {shop.products.map((p, i) => (
                    <div key={i} className="menu-item">
                      <span className="item-name">{p.name}</span>
                      <span className="item-price">₹{p.price}</span>
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
              <div className="reviews-header-row">
                <h2 style={{ margin: 0 }}>Recent Reviews ({reviews.length})</h2>
                <span className="review-cycle-badge">Monthly Cycle</span>
              </div>

              <div className="review-filters">
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
                  <form
                    onSubmit={handleSubmitReview}
                    className="review-form modern-form"
                  >
                    <h4 className="form-title">Rate your experience</h4>
                    <div className="star-input-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star-input ${
                            star <= rating ? "filled" : ""
                          }`}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      required
                      placeholder="Share your experience with others..."
                      className="modern-textarea"
                    />
                    <button className="btn-primary full-width">
                      Post Review
                    </button>
                  </form>
                ) : (
                  <div className="login-prompt success-prompt">
                    <span className="prompt-icon">✅</span>
                    <div>
                      <strong>Thanks for reviewing!</strong>
                      <p>
                        You are now eligible for a loyalty coin from this
                        vendor.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="login-prompt">
                  {currentUser?.isVendor
                    ? "🚫 Vendors cannot submit reviews."
                    : "🔒 Login to write a review."}
                </div>
              )}

              <div className="reviews-list">
                {displayedReviews.length > 0 ? (
                  displayedReviews.map((r, i) => (
                    <div key={i} className="review-card modern-review">
                      <div className="review-avatar">
                        {getInitials(r.studentName)}
                      </div>
                      <div className="review-content">
                        <div className="review-top">
                          <strong>{r.studentName}</strong>
                          <span className="review-date">{r.date}</span>
                        </div>
                        <StarDisplay count={r.rating} />
                        <p className="review-text">{r.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-reviews">
                    <p>No reviews found for this filter.</p>
                  </div>
                )}
              </div>

              {/* UPDATED: Show button for ANY filter if list > 5 */}
              {filteredReviews.length > 5 && (
                <button
                  className="see-more-reviews-btn"
                  onClick={() => setShowAllReviewsModal(true)}
                >
                  See All {filteredReviews.length}{" "}
                  {filterType === "All" ? "" : filterType} Reviews
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
              {/* UPDATED: Modal Title reflects filter */}
              <h2>
                {filterType === "All" ? "All" : filterType} Reviews (
                {filteredReviews.length})
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowAllReviewsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="reviews-list">
              {filteredReviews.map((r, i) => (
                <div key={i} className="review-card modern-review">
                  <div className="review-avatar">
                    {getInitials(r.studentName)}
                  </div>
                  <div className="review-content">
                    <div className="review-top">
                      <strong>{r.studentName}</strong>
                      <span className="review-date">{r.date}</span>
                    </div>
                    <StarDisplay count={r.rating} />
                    <p className="review-text">{r.text}</p>
                  </div>
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
