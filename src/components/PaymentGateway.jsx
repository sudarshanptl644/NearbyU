import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/vendor.css"; // Now resolved correctly

const PaymentGateway = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Step 1: Connecting
    const timer1 = setTimeout(() => setStep(2), 1500);
    // Step 2: Processing
    const timer2 = setTimeout(() => setStep(3), 3000);
    // Step 3: Success & Redirect
    const timer3 = setTimeout(() => {
      navigate("/vendor-signup", { state: { paymentSuccess: true } });
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="payment-gateway-container">
      <div className="payment-card">
        <div className="spinner-container">
          {step < 3 ? (
            <div className="secure-spinner"></div>
          ) : (
            <div className="success-checkmark">✔</div>
          )}
        </div>

        <h2>
          {step === 1 && "Connecting to Secure Bank..."}
          {step === 2 && "Processing Payment of ₹100..."}
          {step === 3 && "Payment Successful!"}
        </h2>

        <p>Please do not close this window.</p>
        <div className="secure-badge">🔒 256-bit SSL Encrypted</div>
      </div>
    </div>
  );
};

export default PaymentGateway;
