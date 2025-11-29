import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  ref,
  update,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import "../CSS/vendor.css";

const EditShop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const vendorData = location.state?.vendorData;

  const [formData, setFormData] = useState({
    shopName: "",
    category: "Food",
    ownerName: "",
    specialty: "",
    services: "",
    address: "",
    status: "Open",
  });

  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState({ name: "", price: "" });
  const [imageBase64, setImageBase64] = useState("");
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    if (!vendorData) {
      navigate("/");
      return;
    }

    const fetchShopData = async () => {
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
          const shop = data[key];

          setShopId(key);
          setFormData({
            shopName: shop.shopName,
            category: shop.category,
            ownerName: shop.ownerName,
            specialty: shop.specialty || "",
            services: shop.services || "",
            address: shop.address || "",
            status: shop.status || "Open",
          });
          setProducts(shop.products || []);
          setImageBase64(shop.shopImage || "");
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [vendorData, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = () => {
    if (tempProduct.name && tempProduct.price) {
      setProducts([...products, tempProduct]);
      setTempProduct({ name: "", price: "" });
    }
  };

  const handleRemoveProduct = (index) => {
    const updatedList = products.filter((_, i) => i !== index);
    setProducts(updatedList);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("File too large! Max 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!shopId) return;
    setSaving(true);

    try {
      const shopRef = ref(db, `shops/${shopId}`);
      await update(shopRef, {
        ...formData,
        shopImage: imageBase64,
        products: products,
      });

      alert("Shop Details Updated Successfully!");

      // UPDATED: Use navigate(-1) to go back to Profile without creating a loop
      navigate(-1);
    } catch (error) {
      console.error("Error updating shop:", error);
      alert("Failed to update shop.");
    } finally {
      setSaving(false);
    }
  };

  if (!vendorData) return null;

  if (loading)
    return (
      <div className="dashboard-container">
        <p>Loading shop details...</p>
      </div>
    );

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>Edit Shop Details</h2>
        <p className="form-subtitle">
          Update information for <strong>{formData.shopName}</strong>
        </p>

        <form onSubmit={handleSave} className="shop-form">
          <div className="image-upload-section">
            <label>Shop Image</label>
            {imageBase64 && (
              <img src={imageBase64} alt="Preview" className="preview-img" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ marginTop: "10px" }}
            />
          </div>

          <div className="status-toggle-container">
            <label>Shop Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={
                formData.status === "Open"
                  ? "status-select-open"
                  : "status-select-closed"
              }
            >
              <option value="Open">🟢 Open</option>
              <option value="Closed">🔴 Closed</option>
            </select>
          </div>

          <div className="form-grid-row">
            <div className="form-col">
              <label>Shop Name</label>
              <input
                name="shopName"
                value={formData.shopName}
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-col">
              <label>Owner Name</label>
              <input
                name="ownerName"
                value={formData.ownerName}
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Food">Food & Beverage</option>
            <option value="Stationery">Stationery</option>
            <option value="Services">Services</option>
            <option value="Retail">Retail</option>
          </select>

          <label>Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="form-grid-row">
            <div className="form-col">
              <label>Specialty</label>
              <input
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
              />
            </div>
            <div className="form-col">
              <label>Services</label>
              <input
                name="services"
                value={formData.services}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="product-manager-section">
            <h3>Manage Menu</h3>
            <div className="add-product-row">
              <input
                placeholder="Item Name"
                value={tempProduct.name}
                onChange={(e) =>
                  setTempProduct({ ...tempProduct, name: e.target.value })
                }
              />
              <input
                placeholder="Price"
                type="number"
                value={tempProduct.price}
                onChange={(e) =>
                  setTempProduct({ ...tempProduct, price: e.target.value })
                }
                style={{ width: "80px" }}
              />
              <button
                type="button"
                className="add-btn"
                onClick={handleAddProduct}
              >
                Add
              </button>
            </div>

            <ul className="product-list-preview">
              {products.map((p, index) => (
                <li key={index}>
                  <span>
                    {p.name} - <strong>₹{p.price}</strong>
                  </span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="button-group">
            {/* UPDATED: Use navigate(-1) to simply go back */}
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShop;
