import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue, remove } from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";

const Marketplace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData = location.state?.studentData;
  // Retrieve tab state if returning from details page
  const initialTab = location.state?.defaultTab || "vendor";

  const [activeTab, setActiveTab] = useState(initialTab);
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
                  fullShopData: shop, // Store full object for navigation
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
          const itemsArray = Object.entries(data).map(([id, item]) => ({
            id,
            ...item,
          }));
          setStudentItems(itemsArray.reverse());
        } else {
          setStudentItems([]);
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

  // Check ownership for delete
  const isOwner =
    selectedItem &&
    studentData &&
    selectedItem.sellerEmail === studentData.email;

  const handleDeleteItem = async () => {
    if (!selectedItem || !isOwner) return;
    if (!window.confirm("Delete this listing?")) return;

    try {
      await remove(ref(db, `marketplace_items/${selectedItem.id}`));
      setSelectedItem(null);
    } catch (error) {
      alert("Failed to delete listing.");
    }
  };

  return (
    <div className="student-page">
      <Navbar userData={studentData} />

      <div className="main-content">
        <div className="marketplace-header">
          <h1>Campus Marketplace</h1>
          <p>Buy from shops or trade with peers.</p>

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

          <div className="search-wrapper">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder={
                  activeTab === "vendor"
                    ? "Search pizzas..."
                    : "Search used books..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>

        {activeTab === "student" && (
          <div
            className="floating-sell-btn"
            onClick={() => navigate("/sell-item", { state: { studentData } })}
          >
            <span>+</span> Sell Item
          </div>
        )}

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
                      // UPDATED: Pass 'from' and 'defaultTab'
                      navigate("/shop-details", {
                        state: {
                          shop: item.fullShopData || { shopId: item.shopId },
                          studentData,
                          from: "/marketplace",
                          defaultTab: "vendor",
                        },
                      });
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                >
                  <div className="marketplace-image-box">
                    <img
                      src={
                        item.image ||
                        item.shopImage ||
                        "https://via.placeholder.com/300x200"
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
              </div>
            )}
          </div>
        )}
      </div>

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
                {isOwner ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <p>Your Listing</p>
                    <button
                      className="btn-primary"
                      style={{ background: "#ef4444" }}
                      onClick={handleDeleteItem}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4>Seller</h4>
                      <p>{selectedItem.sellerName}</p>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => alert(`Contact: ${selectedItem.contact}`)}
                    >
                      Contact
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
