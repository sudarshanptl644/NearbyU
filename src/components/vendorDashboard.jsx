import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  update,
} from "firebase/database";
import "../CSS/vendor.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vendorData = location.state?.vendorData;

  const [myShop, setMyShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [newImageBase64, setNewImageBase64] = useState(null);

  const [tempProduct, setTempProduct] = useState({ name: "", price: "" });

  useEffect(() => {
    if (!vendorData) {
      navigate("/");
      return;
    }

    const checkShopStatus = async () => {
      try {
        const shopsRef = ref(db, "shops");
        const q = query(
          shopsRef,
          orderByChild("vendorUsername"),
          equalTo(vendorData.username)
        );
        const snapshot = await get(q);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const key = Object.keys(data)[0];
          const shopObj = data[key];

          setMyShop(shopObj);
          setEditForm({ ...shopObj, products: shopObj.products || [] });
          setNewImageBase64(shopObj.shopImage);

          // UPDATED: Auto-redirect to Main App if shop exists
          // This ensures registered vendors don't stay on this dashboard
          navigate("/student-home", {
            state: {
              studentData: {
                name: vendorData.username + " (Vendor View)",
                email: "vendor_preview@nearbyu.com",
                isVendor: true,
                originalVendorData: vendorData,
              },
            },
          });
        } else {
          // No shop found, stay here to show "Register" card
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
        setLoading(false);
      }
    };

    checkShopStatus();
  }, [vendorData, navigate]);

  // ... (Keep handlers just in case, though redirect happens first) ...
  const handleImageChange = (e) => {
    /* ... */
  };
  const handleAddProduct = () => {
    /* ... */
  };
  const handleRemoveProduct = (index) => {
    /* ... */
  };
  const handleSaveChanges = async (e) => {
    /* ... */
  };

  // This function handles the card click to register
  const handleRegisterClick = () => {
    navigate("/register-shop", { state: { vendorData } });
  };

  if (!vendorData) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Vendor Portal</h1>
        <p>Welcome, {vendorData.username}</p>
      </div>

      {loading ? (
        <p>Checking shop status...</p>
      ) : (
        <div className="options-grid">
          {/* REMOVED: "Access Main App" Card */}
          {/* REMOVED: "My Shop" Display (Since we redirect if shop exists) */}

          {/* ONLY SHOW: Register Card (If no shop exists) */}
          {!myShop && (
            <div className="option-card" onClick={handleRegisterClick}>
              <div className="icon">➕</div>
              <h3>Register Your Shop</h3>
              <p>
                You haven't listed a shop yet. Click here to setup your store
                profile.
              </p>
            </div>
          )}
        </div>
      )}
      <button className="logout-btn" onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
};

export default VendorDashboard;
