import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { ref, set } from "firebase/database";
import "../CSS/vendor.css";

const RegisterShop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const vendorData = location.state?.vendorData;

  useEffect(() => {
    if (!vendorData) navigate("/");
  }, [vendorData, navigate]);

  const [formData, setFormData] = useState({
    shopName: "",
    category: "Food",
    // REMOVED: description
    ownerName: "",
    specialty: "",
    services: "",
    address: "",
  });

  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState({ name: "", price: "" });
  const [imageBase64, setImageBase64] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = () => {
    if (tempProduct.name && tempProduct.price) {
      setProducts([...products, tempProduct]);
      setTempProduct({ name: "", price: "" });
    } else {
      alert("Please enter both product name and price.");
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
        alert("File too large! Please select an image under 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- STRICT VALIDATION ---
    if (
      !formData.shopName.trim() ||
      !formData.ownerName.trim() ||
      !formData.specialty.trim() ||
      !formData.services.trim() ||
      !formData.address.trim()
      // REMOVED: description check
    ) {
      alert("Please fill in ALL fields including Address before registering.");
      return;
    }

    if (!imageBase64) {
      alert("Please upload a shop image.");
      return;
    }

    if (products.length === 0) {
      alert("Please add at least one product/item to your menu.");
      return;
    }

    setLoading(true);

    try {
      const customShopId = formData.shopName
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase();
      const shopRef = ref(db, "shops/" + customShopId);

      await set(shopRef, {
        ...formData,
        shopId: customShopId,
        vendorUsername: vendorData.username,
        shopImage: imageBase64,
        products: products,
        status: "Open",
        createdAt: new Date().toISOString(),
      });

      alert("Shop Registered Successfully!");

      // Redirect DIRECTLY to Student Dashboard as a Vendor
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
    } catch (error) {
      console.error("Error adding shop:", error);
      alert("Failed to register shop.");
    } finally {
      setLoading(false);
    }
  };

  if (!vendorData) return null;

  return (
    <div className="form-page-container">
      <div className="form-card">
        <h2>Register Your Shop</h2>
        <p className="form-subtitle">
          Registering as: <strong>{vendorData.username}</strong>
        </p>

        <form onSubmit={handleSubmit} className="shop-form">
          <div className="image-upload-section">
            <label>
              Shop Image <span style={{ color: "red" }}>*</span>
            </label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageBase64 && (
              <img src={imageBase64} alt="Preview" className="preview-img" />
            )}
          </div>

          <div className="form-grid-row">
            <div className="form-col">
              <label>
                Shop Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="shopName"
                placeholder="e.g. Campus Coffee"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-col">
              <label>
                Owner Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="ownerName"
                placeholder="Your Name"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <label>
            Category <span style={{ color: "red" }}>*</span>
          </label>
          <select name="category" onChange={handleChange}>
            <option value="Food">Food & Beverage</option>
            <option value="Stationery">Stationery</option>
            <option value="Services">Services</option>
            <option value="Retail">Retail</option>
          </select>

          <label>
            Shop Address / Location <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="address"
            placeholder="e.g. Building 5, Ground Floor, Near Library"
            required
            onChange={handleChange}
          />

          <div className="form-grid-row">
            <div className="form-col">
              <label>
                Specialty <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="specialty"
                placeholder="e.g. Gourmet Coffee"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-col">
              <label>
                Services <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="services"
                placeholder="e.g. WiFi, AC"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* REMOVED: Description Textarea */}

          <div className="product-manager-section">
            <h3>
              Add Products / Menu <span style={{ color: "red" }}>*</span>
            </h3>
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
                style={{ width: "100px" }}
              />
              <button
                type="button"
                className="add-btn"
                onClick={handleAddProduct}
              >
                Add
              </button>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              At least one product required.
            </p>

            {products.length > 0 && (
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
            )}
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/vendor-dashboard", { state: { vendorData } })
              }
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterShop;
