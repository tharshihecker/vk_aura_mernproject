import React from "react";
import "./OrderProgressBar.css";

const steps = [
  { label: "Pending", icon: "⏳" },
  { label: "Success", icon: "🧾" },
  { label: "Shipping", icon: "🚚" },
  { label: "Delivered", icon: "📦" }
];

const OrderProgressBar = ({ status }) => {
  const getStepIndex = () => {
    switch (status.toLowerCase()) {
      case "pending": return 0;
      case "success": return 1;
      case "shipping": return 2;
      case "delivered": return 3;
      case "canceled":
      case "removed":
        return -1;
      default: return 0;
    }
  };

  const currentStep = getStepIndex();

  if (currentStep === -1) {
    if (status.toLowerCase() === "canceled") {
        return <div className="cancel-label">❌ Order Cancelled</div>;
      }
      
    else if (status.toLowerCase() === "removed") {
        return <div className="remove-label">🗑️ Order Removed</div>;
      }
      
  }

  return (
    <div className="progress-bar">
      {steps.map((step, index) => {
        const isActive = index <= currentStep; // ✅ FIX: define isActive here
  
        return (
          <div
            key={step.label}
            className={`step-item ${isActive ? "active" : ""}`}
          >
            <div className="step-icon">
  <span className="base-icon">{step.icon}</span>
  {isActive && <span className="tick-icon">✔</span>}
</div>


  
            <div className="step-label">{step.label}</div>
            {/* Optional step-line if you reintroduce connecting lines */}
            {/* {index < steps.length - 1 && <div className="step-line" />} */}
          </div>
        );
      })}
    </div>
  );
  
};

export default OrderProgressBar;
