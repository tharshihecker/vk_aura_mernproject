import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VeiwBooking.css";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";


const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);

  const [orderCounts, setOrderCounts] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    removedOrders: 0,
    canceledOrders: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.data.isAdmin) return navigate("/user-home");

        const [bookingsRes, productRes, packageRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/packages")
        ]);

        const [ratingsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/order-rating") 
        ]);
        
        setRatings(ratingsRes.data);
        

        const sorted = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);
        setProducts(productRes.data);
        setPackages(packageRes.data);
        updateOrderCounts(sorted);
        calculateSalesAndProfit(sorted, productRes.data, packageRes.data);
      } catch (err) {
        setError("❌ Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);



  useEffect(() => {
    const filteredOrders = bookings.filter(order => {
      return order.status === "delivered" && isInDateRange(order.createdAt);
    });
    calculateSalesAndProfit(filteredOrders, products, packages);
  }, [startDate, endDate, bookings, products, packages]);

  const updateOrderCounts = (orders) => {
    setOrderCounts({
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      shippingOrders: orders.filter(o => o.status === "shipped").length,
      deliveredOrders: orders.filter(o => o.status === "delivered").length,
      removedOrders: orders.filter(o => o.status === "removed").length,
      canceledOrders: orders.filter(o => o.status === "canceled").length,
    });
  };

  const isInDateRange = (dateStr) => {
    const orderDate = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    // Remove time part
    orderDate.setHours(0, 0, 0, 0);
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999); // end of the day
  
    return (!start || orderDate >= start) && (!end || orderDate <= end);
  };
  

  const calculateSalesAndProfit = (orders, productList, packageList) => {
    let sales = 0;
    let profit = 0;
  
    orders.forEach(order => {
      sales += order.total;
      let orderHasAllData = true;
      let orderProfit = 0;
  
      order.items.forEach(item => {
        let itemProfit = 0;
  
        if (!item.products || !Array.isArray(item.products)) {
          orderHasAllData = false;
          return;
        }
  
        for (const prod of item.products) {
          if (
            prod.costPriceAtOrder === undefined ||
            prod.sellingPriceAtOrder === undefined ||
            prod.quantity === undefined
          ) {
            orderHasAllData = false;
            return;
          }
  
          const quantity = Number(prod.quantity || 0);
          const cost = Number(prod.costPriceAtOrder || 0);
          const sell = Number(prod.sellingPriceAtOrder || 0);
          itemProfit += (sell - cost) * quantity * (item.quantity || 1);
        }
  
        if (item.price === undefined || item.finalPrice === undefined) {
          orderHasAllData = false;
          return;
        }
  
        const discount = (item.price - item.finalPrice) * (item.quantity || 1);
        orderProfit += itemProfit - discount;
      });
  
      if (orderHasAllData) {
        profit += orderProfit;
      }
    });
  
    setTotalSales(sales);
    setTotalProfit(profit);
  };
  
  
  
  const calculateOrderProfit = (order) => {
    if (order.status !== "delivered" || !isInDateRange(order.createdAt)) return "0.00";
  
    let totalProfit = 0;
    let hasAllPricingData = true;
  
    for (const item of order.items) {
      let itemProfit = 0;
  
      if (!item.products || !Array.isArray(item.products)) {
        hasAllPricingData = false;
        break;
      }
  
      for (const prod of item.products) {
        if (
          prod.costPriceAtOrder === undefined ||
          prod.sellingPriceAtOrder === undefined ||
          prod.quantity === undefined
        ) {
          hasAllPricingData = false;
          break;
        }
  
        const quantity = Number(prod.quantity || 0);
        const cost = Number(prod.costPriceAtOrder || 0);
        const sell = Number(prod.sellingPriceAtOrder || 0);
        itemProfit += (sell - cost) * quantity * (item.quantity || 1);
      }
  
      if (item.price === undefined || item.finalPrice === undefined) {
        hasAllPricingData = false;
        break;
      }
  
      const discount = (item.price - item.finalPrice) * (item.quantity || 1);
      totalProfit += itemProfit - discount;
    }
  
    if (!hasAllPricingData) return "N/A";
    return totalProfit.toFixed(2);
  };
  
  
  
  
  
  
  

  
  

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("❌ Unauthorized! Please log in again.");
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedOrder = response.data.order;
  
      const updatedBookings = bookings.map((order) =>
        order._id === orderId ? { ...order, status: updatedOrder.status } : order
      );
  
      setBookings(updatedBookings);
      updateOrderCounts(updatedBookings);
      calculateSalesAndProfit(updatedBookings, products, packages);
  
      // ✅ Send email notification for relevant statuses
      if (["success", "removed", "shipped", "delivered"].includes(status)) {
        await axios.post(
          "http://localhost:5000/api/notifications/send-status-email",
          {
            orderId: updatedOrder._id,
            status: updatedOrder.status,
            userEmail: updatedOrder.user,
            userName: updatedOrder.userName || "User"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      alert(`✅ Order marked as ${status} successfully!`);
    } catch (err) {
      console.error(`❌ Failed to update order to ${status}:`, err);
      alert(err.response?.data?.message || "❌ Failed to update order.");
    }
  };
  
  const handleStartDateChange = e => {
    const sel = new Date(e.target.value);
    if (endDate) {
      const end = new Date(endDate);
      if (sel > end) {
        return alert("⚠️ Start date must be before end date.");
      }
    }
    setStartDate(e.target.value);
  };
  
  const handleEndDateChange = e => {
    const sel = new Date(e.target.value);
    if (startDate) {
      const start = new Date(startDate);
      if (sel < start) {
        return alert("⚠️ End date must be after start date.");
      }
    }
    setEndDate(e.target.value);
  };
  

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const filteredBookings = bookings.filter(order => {
    const dt = new Date(order.createdAt);
    const orderDateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); // Remove time
  
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
  
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
  
    const s = searchTerm.toLowerCase();
    const monthName = dt.toLocaleString("default", { month: "long" }).toLowerCase();
    const monthIdx = dt.getMonth() + 1;
  
    return (
      (!start || orderDateOnly >= start) &&
      (!end || orderDateOnly <= end) &&
      (
        (order.user && order.user.toLowerCase().includes(s)) ||
        (order.userName && order.userName.toLowerCase().includes(s)) ||
        (order.status && order.status.toLowerCase().includes(s)) ||
        dt.toLocaleDateString().includes(s) ||
        monthName.includes(s) ||
        (!isNaN(s) && parseInt(s) === monthIdx)
      )
    );
  });
  




  const findOrderRating = (orderId) => {
    const orderRating = ratings.find(r => r.orderId === orderId); // 👈 match by order ID
    
    if (!orderRating) return "N/A";
  
    const rating = orderRating.rating;
  
    const emojis = {
      1: "😡",
      2: "😕",
      3: "😐",
      4: "😊",
      5: "😍"
    };
  
    const emoji = emojis[rating] || "";
  
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span>{rating}</span>
        <span style={{ fontSize: "28px" }}>{emoji}</span> {/* ⭐️ Big Emoji */}
      </div>
    );
  };
  
  
  
  
  

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>
      <div className="main-content">
        <div className="view-bookings-container">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        📋 All Order Booking Details </p>
         

          <h4 className="summary-heading" style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495'}}>📦 Order Summary</h4>
          <div className="status-box-row">
            <div className="status-box">Total: {orderCounts.totalOrders}</div>
            <div className="status-box">Pending: {orderCounts.pendingOrders}</div>
            <div className="status-box">Shipping: {orderCounts.shippingOrders}</div>
            <div className="status-box">Delivered: {orderCounts.deliveredOrders}</div>
            <div className="status-box">Removed: {orderCounts.removedOrders}</div>
            <div className="status-box">Canceled: {orderCounts.canceledOrders}</div>
          </div>

          <h4 className="summary-heading" style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495'}}>💰 Sales & Profit</h4>

          <div
            className="totals-container"
             style={{
             display: 'flex',
             gap: '40px',               
             marginTop: '20px',
             flexWrap: 'nowrap',       
             justifyContent: 'center'  
            }}
            >
            <div className="totals-box" style={{ width: '450px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Total Sales</h3>
             <p>Total Sales: Rs {totalSales}</p>
            </div>
            <div className="totals-box" style={{ width: '450px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Profit</h3>
              <p>Total Profit: Rs {totalProfit.toFixed(2)}</p>
            </div>
          </div>


          
          

          <div className="filters-row1">
            <input
              type="text"
              placeholder="Search by User, Name, Phone, Status, or Date 🔍︎"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            <div className="date-input1" >
              <label>Start Date:</label>
              <input style={{height:'35px'}} type="date" value={startDate} onChange={handleStartDateChange} max={today} />
            </div>
            <div className="date-input1">
              <label>End Date:</label>
              <input  style={{height:'35px'}}type="date" value={endDate} onChange={handleEndDateChange} max={today}/>
            </div>
            <button  className="clear-date-btn1" onClick={clearFilters}>
              ❌ Clear
            </button>
            
          </div>

          <div className="booking-table">
            {filteredBookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <table>
                <thead>
  <tr>
    <th>User Details</th>
    <th>Location</th>
    <th>Items</th>
    <th>Total + Profit</th>
    <th>Status</th>
    <th style={{width:"100px"}}>Action</th>
    <th>Rating</th>
  </tr>
</thead>
<tbody>
  {filteredBookings.map(order => (
    <tr key={order._id}>
      <td >
        <div><b>Email:</b> {order.user || "N/A"}</div>
        <div><b>Name:</b> {order.userName || "N/A"}</div>
        <div><b>Phone:</b> {order.userPhone || "N/A"}</div>
      </td>
      <td>{order.location || "N/A"}</td>
      <td>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.name} (x{item.quantity}) – Rs. {item.finalPrice || item.price}
            </li>
          ))}
        </ul>
      </td>
      <td>
        Rs. {order.total}
        <br />
        <span style={{ color: "green", fontSize: "0.9em" }}>
          Profit: Rs {calculateOrderProfit(order)}
        </span>
      </td>
      <td className="datetime">{order.status}<br></br> {new Date(order.createdAt).toLocaleString()}</td>
      <td className="actionbtns"  style={{width:"100px"}} >
        {order.status === "pending" ? (
          <>
            <button  className="confirm-btn" onClick={() => {
              if (window.confirm("Are you sure you want to confirm this order?")) {
                updateOrderStatus(order._id, "confirm");
              }
            }}  style={{width:"100px"}}>✅Confirm</button>
            <button className="remove-btn" onClick={() => {
              if (window.confirm("Are you sure you want to remove this order?")) {
                updateOrderStatus(order._id, "remove");
              }
            }}  style={{width:"100px"}}>❌Remove</button>
          </>
        ) : order.status === "success" ? (
          <button className="ship-btn" onClick={() => {
            if (window.confirm("Are you sure you want to ship this order?")) {
              updateOrderStatus(order._id, "ship");
            }
          }}style={{width:"100px"}}>🚚Ship</button>
        ) : order.status === "shipped" ? (
          <button className="deliver-btn" onClick={() => {
            if (window.confirm("Are you sure you want to deliver this order?")) {
              updateOrderStatus(order._id, "deliver");
            }
          }}style={{width:"100px"}}>📦Deliver</button>
        ) : order.status === "delivered" ? (
          <span className="delivered-tag">✅Delivered</span>
        ) : order.status === "removed" ? (
          <span className="removed-tag">❌Removed</span>
        ) : order.status === "canceled" ? (
          <span className="canceled-tag">❌Canceled</span>
        ) : (
          <span>✔Confirmed</span>
        )}
      </td>
      <td>{findOrderRating(order._id)}</td>

    </tr>
  ))}
</tbody>

              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookings;
