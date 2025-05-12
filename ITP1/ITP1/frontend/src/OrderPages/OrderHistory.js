import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./OrderHistory.css";
import OrderProgressBar from "./OrderProgressBar"; // top of file
import UserComponent from "../Component/Usercomponent";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from "react-icons/fa";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const encodedUserName = encodeURIComponent(user.email);
        const response = await axios.get(`http://localhost:5000/api/orders/${encodedUserName}`);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order? \nyour money will be returned⚠️");
    if (!confirmCancel) return;

    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: "canceled" } : order
      ));
      alert("Order has been canceled.\n📌Contact us to get your money back❗");
    } catch (error) {
      alert("Failed to cancel order.");
    }
  };

  const monthMap = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  
  const filteredOrders = orders.filter(order => {
    const createdAt = new Date(order.createdAt);
    const monthIndex = createdAt.getMonth(); // 0–11
    const monthName = createdAt.toLocaleString("default", { month: "long" }); // e.g., "April"
    const search = searchQuery.toLowerCase();
  
    const matchesMonthName = monthName.toLowerCase().includes(search);
    const matchesMonthNumber = !isNaN(search) && parseInt(search) === monthIndex + 1;
    const matchesMappedMonth = monthMap[search] !== undefined && monthMap[search] === monthIndex;
  
    return (
      order.status.toLowerCase().includes(search) ||
      createdAt.toLocaleDateString().includes(search) ||
      matchesMonthName || matchesMonthNumber || matchesMappedMonth
    );
  });
  

  return (
    <>
    <div>
      <UserComponent user={user} />

      <p><br></br></p>   
   
    <div className="order-history-container1" >
      
      <p className="OrderHis1">🛒 Order History</p>
      <br />
      <input
        type="text"
        className="search-bar1"
        placeholder="Search by date or status...🔍︎"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && filteredOrders.length === 0 && <p>No matching orders found.</p>}
      <div className="order-grid1">
      {filteredOrders.map((order) => (
        
        <div key={order._id} className="order-card1">
          <OrderProgressBar status={order.status} />

          <h3>📅 Date: {new Date(order.createdAt).toLocaleDateString()}</h3>
          <h3>⏰ Time: {new Date(order.createdAt).toLocaleTimeString()}</h3>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>{item.name} (x{item.quantity}) - Rs.{item.finalPrice}</li>
            ))}
          </ul>
          <h3>Total: Rs.{order.total}</h3>
          <h3>Status: {order.status}</h3>
          {order.status === "pending" && (
            <div className="order-actions">
              <button onClick={() => handleCancelOrder(order._id)}>❌ Cancel</button>
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
    
    </div>



<footer className="footer">
            <div className="footer-content">
              <p>&copy; 2025 VK Aura. All rights reserved.</p>
              <div className="social-media">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              </div>
            </div>
          </footer>
          </>

  );
};

export default OrderHistory;
