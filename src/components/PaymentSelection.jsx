import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/vendor.css"; // We will add styles here

const PaymentSelection = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("UPI"); // 'UPI' or 'CARD'

  // Form States
  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [error, setError] = useState("");

  const handlePay = (e) => {
    e.preventDefault();
    setError("");

    // --- MOCK VALIDATION ---
    if (method === "UPI") {
      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g., name@bank)");
        return;
      }
    } else {
      if (cardData.number.length < 16 || cardData.cvv.length < 3) {
        setError("Invalid Card Details. Please check again.");
        return;
      }
    }

    // Validation Passed -> Go to Processing Screen
    navigate("/payment-gateway");
  };

  return (
    <div className="payment-page-container">
      <div className="checkout-card">
        {/* LEFT: ORDER SUMMARY */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-item">
            <span>Vendor Premium Plan</span>
            <span>₹100.00</span>
          </div>
          <div className="order-item">
            <span>GST (18%)</span>
            <span>₹18.00</span>
          </div>
          <div className="total-row">
            <span>Total Payable</span>
            <span className="total-amount">₹118.00</span>
          </div>
          <div className="trust-badges">
            <span>🔒 Secure Checkout</span>
            <span>⚡ Instant Activation</span>
          </div>
        </div>

        {/* RIGHT: PAYMENT FORM */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>

          <div className="method-tabs">
            <button
              className={`method-tab ${method === "UPI" ? "active" : ""}`}
              onClick={() => setMethod("UPI")}
            >
              UPI / QR
            </button>
            <button
              className={`method-tab ${method === "CARD" ? "active" : ""}`}
              onClick={() => setMethod("CARD")}
            >
              Card
            </button>
          </div>

          <form onSubmit={handlePay} className="payment-form">
            {/* UPI FORM */}
            {method === "UPI" && (
              <div className="method-content fade-in">
                <label>Enter UPI ID</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="payment-input"
                />
                <p className="payment-hint">Google Pay, PhonePe, Paytm, BHIM</p>
              </div>
            )}

            {/* CARD FORM */}
            {method === "CARD" && (
              <div className="method-content fade-in">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength="19"
                  value={cardData.number}
                  onChange={(e) =>
                    setCardData({ ...cardData, number: e.target.value })
                  }
                  className="payment-input"
                />

                <div className="card-row">
                  <div>
                    <label>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardData.expiry}
                      onChange={(e) =>
                        setCardData({ ...cardData, expiry: e.target.value })
                      }
                      className="payment-input"
                    />
                  </div>
                  <div>
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({ ...cardData, cvv: e.target.value })
                      }
                      className="payment-input"
                    />
                  </div>
                </div>

                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on Card"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData({ ...cardData, name: e.target.value })
                  }
                  className="payment-input"
                />
              </div>
            )}

            {error && <div className="payment-error">{error}</div>}

            <button type="submit" className="pay-now-btn">
              Pay ₹118.00
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
