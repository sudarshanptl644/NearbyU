import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const Marketplace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData = location.state?.studentData;

  const [activeTab, setActiveTab] = useState("vendor"); // 'vendor' or 'student'
  const [vendorItems, setVendorItems] = useState([]);
  const [studentItems, setStudentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!studentData) {
      navigate("/");
      return;
    }

    const fetchData = () => {
      // 1. Fetch Vendor Items
      const shopsRef = ref(db, "shops");
      onValue(shopsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const shops = Object.values(data);
          const vList = [];
          shops.forEach((shop) => {
            if (shop.products) {
              shop.products.forEach((p) => {
                vList.push({
                  ...p,
                  shopName: shop.shopName,
                  shopId: shop.shopId,
                  image: p.image || shop.shopImage,
                  status: shop.status,
                  type: "vendor",
                });
              });
            }
          });
          setVendorItems(vList);
        }
      });

      // 2. Fetch Student Resell Items
      const itemsRef = ref(db, "marketplace_items");
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudentItems(Object.values(data).reverse());
        }
      });

      setLoading(false);
    };

    fetchData();
  }, [studentData, navigate]);

  const currentList = activeTab === "vendor" ? vendorItems : studentItems;
  const filteredItems = currentList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const title = item.name || item.title || "";
    const source = item.shopName || item.sellerName || "";
    const category = item.category || "";
    return (
      title.toLowerCase().includes(term) ||
      source.toLowerCase().includes(term) ||
      category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="student-page">
      <Navbar userData={studentData} />

      <div className="main-content">
        {/* HEADER & TOGGLE */}
        <div className="marketplace-header">
          <h1>Campus Marketplace</h1>
          <p>Buy from shops or trade with peers.</p>

          {/* Modern Segmented Toggle */}
          <div className="toggle-pill-container">
            <button
              className={`toggle-pill-btn ${
                activeTab === "vendor" ? "active" : ""
              }`}
              onClick={() => setActiveTab("vendor")}
            >
              🏪 Vendor Stores
            </button>
            <button
              className={`toggle-pill-btn ${
                activeTab === "student" ? "active" : ""
              }`}
              onClick={() => setActiveTab("student")}
            >
              🎓 Student Resell
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-wrapper">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder={
                  activeTab === "vendor"
                    ? "Search pizzas, stationery..."
                    : "Search used books, cycles..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>

        {/* SELL CTA (Student Tab Only) */}
        {activeTab === "student" && (
          <div
            className="floating-sell-btn"
            onClick={() => navigate("/sell-item", { state: { studentData } })}
          >
            <span>+</span> Sell Item
          </div>
        )}

        {/* LOADING & GRID */}
        {loading ? (
          <p className="loading-text">Loading marketplace...</p>
        ) : (
          <div className="shop-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={`${item.id || item.shopId}-${index}`}
                  className="marketplace-card"
                  onClick={() => {
                    if (activeTab === "vendor") {
                      navigate("/shop-details", {
                        state: { shop: { shopId: item.shopId }, studentData },
                      });
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                >
                  {/* Image Area */}
                  <div className="marketplace-image-box">
                    <img
                      src={
                        item.image ||
                        item.shopImage ||
                        "https://via.placeholder.com/300x200?text=Item"
                      }
                      alt={item.name || item.title}
                    />
                    <span
                      className={`marketplace-badge ${
                        activeTab === "vendor"
                          ? "badge-vendor"
                          : "badge-student"
                      }`}
                    >
                      {activeTab === "vendor" ? item.shopName : "Student Ad"}
                    </span>

                    {activeTab === "vendor" && (
                      <span
                        className={`status-pill-small ${
                          item.status === "Closed" ? "closed" : "open"
                        }`}
                      >
                        {item.status === "Closed" ? "Closed" : "Open"}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="marketplace-info">
                    <div className="info-top">
                      <h3>{item.name || item.title}</h3>
                      <span className="price-tag">₹{item.price}</span>
                    </div>

                    <div className="info-bottom">
                      {activeTab === "vendor" ? (
                        <span className="link-text">Visit Shop →</span>
                      ) : (
                        <span className="seller-name">
                          By: {item.sellerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>🔍 No items found</h3>
                <p>Try checking the other tab or search for something else.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ITEM DETAILS MODAL (For Student Items) */}
      {selectedItem && (
        <div
          className="reviews-modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="reviews-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Item Details</h2>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>

            <div className="item-modal-body">
              <img
                src={
                  selectedItem.image || "https://via.placeholder.com/400x300"
                }
                className="modal-hero-img"
                alt="Item"
              />
              <div className="modal-info-row">
                <h1>{selectedItem.title}</h1>
                <span className="modal-price">₹{selectedItem.price}</span>
              </div>
              <span className="modal-category-pill">
                {selectedItem.category}
              </span>

              <div className="modal-description-box">
                <h4>Description</h4>
                <p>{selectedItem.description || "No description provided."}</p>
              </div>

              <div className="modal-contact-box">
                <div>
                  <h4>Seller</h4>
                  <p>{selectedItem.sellerName}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    alert(
                      `Contact Details:\n\nEmail: ${selectedItem.sellerEmail}\nPhone/Info: ${selectedItem.contact}`
                    )
                  }
                >
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
