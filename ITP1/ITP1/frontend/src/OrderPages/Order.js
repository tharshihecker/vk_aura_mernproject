// ✅ Order.js (Modified to enrich cart with current product cost/selling prices)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input, message, Checkbox, Modal } from "antd";
import { useAuth } from "../hooks/useAuth";
import "./Order.css";
import UserComponent from "../Component/Usercomponent";

const OrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (!user) return;
    const storedCart = JSON.parse(localStorage.getItem(`cart_user_${user._id}`)) || [];
    setCart(storedCart);
    setPhone(user?.phone || "");
  }, [user]);

  const [locationLoading, setLocationLoading] = useState(false);

  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0).toFixed(2);

  const handleQuantityChange = (id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) {
      message.error("Quantity cannot be less than 1");
      qty = 1;
    } else if (qty > 25) {
      message.error("Quantity cannot be more than 25");
      qty = 25;
    }
    const updated = cart.map(i => (i._id === id ? { ...i, quantity: qty } : i));
    setCart(updated);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updated));
  };

  const handleRemoveFromCart = id => {
    const updated = cart.filter(i => i._id !== id);
    setCart(updated);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updated));
  };

  const handlePay = async () => {
    if (!user) {
      message.error("❌ User not logged in! Please log in to continue.");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      message.error("Your cart is empty!");
      return;
    }

    try {
      const pkgRes = await axios.get("http://localhost:5000/api/packages");
      const prodRes = await axios.get("http://localhost:5000/api/products");
      const allPackages = pkgRes.data;
      const allProducts = prodRes.data;

      const enrichedCart = cart.map(item => {
        const pkg = allPackages.find(p => p._id === item._id || p.name === item.name);
        const enrichedProducts = pkg?.products.map(({ productId, quantity }) => {
          const prod = allProducts.find(p => p._id === productId._id || p._id === productId);
          return {
            productId: prod?._id,
            productName: prod?.name,
            quantity,
            costPriceAtOrder: prod?.costPrice,
            sellingPriceAtOrder: prod?.sellingPrice
          };
        }) || [];

        return {
          ...item,
          price: pkg?.totalPrice,
        finalPrice: pkg?.finalPrice,
        discountRate: pkg?.discount || 0, 
        products: enrichedProducts
        };
      });

      localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(enrichedCart));
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Error enriching cart:", error);
      message.error("❌ Could not prepare order. Try again.");
    }
  };

  const handleConfirmLocation = () => {
    const txt = location.trim();
    const phoneTrimmed = phone.trim();
  
    if (!txt) {
      message.error("Please enter your location.");
      return;
    }
  
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      message.error("Please enter a valid 10-digit phone number starting with 0.");
      return;
    }
  
   
    if (txt.length >= 5) {
      proceedToPayment();
    } else {
      message.error("Please enter a valid address (at least 5 characters) or click ‘Share My Location’.");
    }
  };
  
  const proceedToPayment = () => {
    try {
      localStorage.setItem(`location_user_${user._id}`, location);
      localStorage.setItem(`phone_user_${user._id}`, phone);
      localStorage.setItem(`total_price_user_${user._id}`, getTotalPrice());

      message.success("✅ Location saved. Proceeding to payment...");
      setModalVisible(false);
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Error saving location:", error);
      message.error("❌ Could not proceed to payment. Try again.");
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      message.error("❌ Geolocation is not supported by your browser.");
      return;
    }
  
    setLocationLoading(true); // start loading
  
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const r = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: { lat: latitude, lon: longitude, format: "json", 'accept-language': 'ta' },
          });
          const addr = r.data.display_name;
          if (addr) {
            setLocation(addr);
            message.success("✅ Location detected and filled!");
          } else {
            const fallback = `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`;
            setLocation(fallback);
            message.warning("⚠️ Coordinates used (no address found).");
          }
        } catch {
          const fallback = `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`;
          setLocation(fallback);
          message.error("❌ Couldn't fetch address. Coordinates used.");
        } finally {
          setLocationLoading(false); // stop loading
        }
      },
      err => {
        console.error("Error getting location:", err);
        message.error("❌ Unable to retrieve your location.");
        setLocationLoading(false); // stop loading
      }
    );
  };
  

  return (
    <div>
      <UserComponent user={user} />
    
    <div className="containerorder">
      <h2>Package Order Summary</h2>

     

      {cart.length > 0 ? (
        <div className="cart">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <h4>{item.name}</h4>
              <p>Rs.{item.finalPrice.toFixed(2)}</p>
              <Input
                type="number"
                min={1}
                max={25}
                value={item.quantity}
                onChange={e => handleQuantityChange(item._id, e.target.value)}
                onFocus={e => e.target.select()}
                onBlur={e => {
                  if (!e.target.value) handleQuantityChange(item._id, "1");
                }}
              />
              <Button id="b3" onClick={() => handleRemoveFromCart(item._id)} type="danger">
                Remove
              </Button>
            </div>
          ))}
          <h3>Total Price : Rs {getTotalPrice()}</h3>
          <div className="terms-checkbox">
            <Checkbox onChange={e => setIsAgreed(e.target.checked)}>
              I agree to the{' '}
              <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
                Terms and Conditions
              </a>.
            </Checkbox>
          </div>
          <Button
            className="pay-button"
            onClick={handlePay}
            type="primary"
            disabled={!isAgreed}
          >
            Pay
          </Button>
        </div>
      ) : (
        <p>No packages in the cart</p>
      )}

      <Button
        className="order-history-button"
        onClick={() => navigate("/OrderHistoryDetails")}
        type="default"
      >
        Order History
      </Button>

      <Modal
        title="Enter Your Location & Phone"
        open={modalVisible}
        onOk={handleConfirmLocation}
        onCancel={() => setModalVisible(false)}
        okText="Proceed to Pay"
      >
        <Input
          placeholder="Enter your location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Button onClick={getUserLocation} type="default" style={{ marginBottom: "10px" }}>
          Share My Location
        </Button>
        {locationLoading && (
        <p style={{ color: "gray", fontStyle: "italic", marginTop: "5px" }}>
        📍 Finding your location...
        </p>
        )}

        <Input
          placeholder="Enter your Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={10}
        />
      </Modal>
    </div>
    </div>
  );
};

export default OrderPage;
