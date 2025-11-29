import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/vendor.css";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    // Redirect to the simulated gateway
    navigate("/payment-gateway");
  };

  return (
    <div className="subscription-container">
      <div className="plan-card">
        <div className="plan-header">
          <h2>Vendor Premium</h2>
          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">100</span>
            <span className="period">/month</span>
          </div>
        </div>

        <ul className="plan-features">
          <li>
            ✅ <strong>List Your Shop</strong> on nearbyU App
          </li>
          <li>
            ✅ <strong>Manage Products</strong> & Prices
          </li>
          <li>
            ✅ <strong>Receive Reviews</strong> from Students
          </li>
          <li>
            ✅ <strong>Verified Badge</strong> for your Shop
          </li>
          <li>
            ✅ <strong>Give Coins</strong> & Build Loyalty
          </li>
        </ul>

        <button
          className="pay-btn"
          onClick={handlePayment}
          disabled={processing}
        >
          Proceed to Pay ₹100
        </button>

        <button className="cancel-sub-btn" onClick={() => navigate("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
