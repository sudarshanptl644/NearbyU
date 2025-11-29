import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, push, set } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css"; // Uses student styles

const SellItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData = location.state?.studentData;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Books",
    description: "",
    contact: "",
  });
  const [imageBase64, setImageBase64] = useState("");

  useEffect(() => {
    if (!studentData) navigate("/");
  }, [studentData, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Image too large (Max 800KB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.price || !formData.contact) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const itemsRef = ref(db, "marketplace_items");
      const newItemRef = push(itemsRef);

      await set(newItemRef, {
        id: newItemRef.key,
        ...formData,
        image: imageBase64,
        sellerName: studentData.name || studentData.username,
        sellerEmail: studentData.email,
        timestamp: new Date().toISOString(),
      });

      alert("Item listed successfully!");
      navigate("/marketplace", { state: { studentData } });
    } catch (error) {
      console.error("Error listing item:", error);
      alert("Failed to list item.");
    } finally {
      setLoading(false);
    }
  };

  if (!studentData) return null;

  return (
    <div className="student-page">
      <Navbar userData={studentData} />

      <div className="main-content">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div
          className="form-page-container"
          style={{ backgroundColor: "transparent" }}
        >
          <div
            className="form-card"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <h2
              style={{
                textAlign: "center",
                marginBottom: "10px",
                color: "#2c3e50",
              }}
            >
              Sell on Campus
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#7f8c8d",
                marginBottom: "30px",
              }}
            >
              Turn your old stuff into cash!
            </p>

            <form onSubmit={handleSubmit} className="review-form">
              {" "}
              {/* Reusing form styles */}
              {/* Image Upload */}
              <div
                className="modern-shop-image-container"
                style={{
                  background: "#f8fafc",
                  border: "2px dashed #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  height: "200px",
                }}
              >
                {imageBase64 ? (
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="card-main-image"
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8" }}>
                    <span style={{ fontSize: "2rem" }}>📷</span>
                    <p>Tap to upload photo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Item Title</label>
                  <input
                    name="title"
                    placeholder="e.g. Engineering Graphics Kit"
                    value={formData.title}
                    onChange={handleChange}
                    className="profile-input" // Reusing input styles
                    required
                  />
                </div>
                <div style={{ width: "120px" }}>
                  <label className="input-label">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    placeholder="250"
                    value={formData.price}
                    onChange={handleChange}
                    className="profile-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="profile-input"
                >
                  <option>Books</option>
                  <option>Stationery</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Cycles/Vehicles</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Condition, how old is it, etc."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="input-label">
                  Contact Info (Phone/Email)
                </label>
                <input
                  name="contact"
                  placeholder="How can buyers reach you?"
                  value={formData.contact}
                  onChange={handleChange}
                  className="profile-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ marginTop: "20px" }}
              >
                {loading ? "Posting..." : "Post Ad"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellItem;
