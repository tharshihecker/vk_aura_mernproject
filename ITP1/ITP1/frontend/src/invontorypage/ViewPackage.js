import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaComments, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import "../styles/ViewPackage.css";
import { Input, Button, Card, Row, Col, message } from "antd"
import UserComponent from "../Component/Usercomponent";

const BASE_URL = "http://localhost:5000";

const ViewPackage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/packages`)
      .then(res => setPackages(res.data || []))
      .catch(err => console.error("Package fetch error", err));
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handlePlaceOrder = () => {
    navigate("/order");
  };

  const addToCart = (pkg) => {
    if (!user) {
      alert("Please log in to add items to the cart.");
      navigate("/login");
      return;
    }
  
    const cartKey = `cart_user_${user._id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItemIndex = cart.findIndex((item) => item._id === pkg._id);
  
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...pkg, quantity: 1 });
    }
  
    localStorage.setItem(cartKey, JSON.stringify(cart));
    message.success(`${pkg.name} added to cart.`);
  };



  const renderProducts = (products) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {products.map((product, index) => (
        <div
          key={index}
          style={{
            flex: "0 0 calc(50% - 12px)",
            background: "#f8f8f8",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <strong>{product.productId.name}</strong><br />
          {product.quantity} {product.productId.unit}
        </div>
      ))}
    </div>
  );



  return (
    <div>
      <UserComponent user={user} />
    
    <div className="view-package-page">
      

      {/* Content */}
      <main className="package-list-content">
        <h2 className="page-title">User Package List</h2>
        <div className="package-grid">
          {packages.map((pkg, idx) => (
            <div className="package-card" key={idx}>
              <img src={pkg.image || "/default.jpg"} alt="Package" className="package-image" />
              <h3>{pkg.name}</h3>
              <div className="product-list">

              {pkg.products?.map((prod, i) => (
           <div key={i} className="product-item">
          {prod.productId.name} – {prod.quantity} {prod.productId.unit}
        </div>
        ))}
        
              </div>
              <p><strong>Total Price:</strong> Rs. {pkg.totalPrice}</p>
              <p><strong>Discount:</strong> {pkg.discount}%</p>
              <p><strong>Final Price:</strong> Rs. {pkg.finalPrice}</p>
              <div className="button-group">
              <button className="add-to-cart-btn" onClick={() => addToCart(pkg)}>Add to Cart</button>

                <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
          </div>
        </div>
      </footer>

      
    </div>
    </div>
  );
};

export default ViewPackage;
