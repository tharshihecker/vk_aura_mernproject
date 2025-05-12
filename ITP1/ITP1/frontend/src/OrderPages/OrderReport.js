// OrderReport.js - Final Production-Ready Version

import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "./OrderReport.css";
import Adminnaviagtion from "../Component/Adminnavigation";
import { FaDownload } from "react-icons/fa";


const highlightMaatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: "#fcd34d", padding: "0 2px" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
const OrderReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start = startDate.toISOString();
      if (endDate) params.end = endDate.toISOString();
      if (statusFilter !== "all") params.status = statusFilter;

      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("\u274C Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatusFilter("all");
    setSearchQuery("");
    fetchOrders(); // Fetch full data again
  };

  const isFilterActive =
  startDate !== null ||
  endDate !== null ||
  searchQuery.trim() !== "" ||
  statusFilter !== "all";

  

  const isInDateRange = (dateStr) => {
    const orderDate = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    orderDate.setHours(0, 0, 0, 0);
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    return (!start || orderDate >= start) && (!end || orderDate <= end);
  };

  const calculateOrderProfit = (order) => {
    if (order.status !== "delivered") return 0; // ✅ Only delivered orders have profit
  
    if (!Array.isArray(order.items)) return 0;
  
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
  
    return hasAllPricingData ? totalProfit : 0;
  };
  

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.user?.toLowerCase().includes(query) ||
      order.userName?.toLowerCase().includes(query) ||
      order.userPhone?.toLowerCase().includes(query) ||
      order.location?.toLowerCase().includes(query);
  
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesDate = isInDateRange(order.createdAt);
  
    return matchesSearch && matchesStatus && matchesDate;
  });
  

  const summary = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    shipped: filteredOrders.filter((o) => o.status === "shipped").length,
    delivered: filteredOrders.filter((o) => o.status === "delivered").length,
    removed: filteredOrders.filter((o) => o.status === "removed").length,
    cancelled: filteredOrders.filter((o) => o.status === "cancelled" || o.status === "canceled").length,
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Email", "Customer", "Phone", "Location", "Status", "Date", "Total", "Profit"]],
      body: filteredOrders.map(order => ([
        order.user,
        order.userName,
        order.userPhone,
        order.location,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
        `Rs. ${order.total.toFixed(2)}`,
        `Rs. ${calculateOrderProfit(order).toFixed(2)}`
      ])),
      startY: 30,
    });
  
    doc.text("Order Summary Report", 14, 20);
    doc.save("order_report.pdf");
  };
  

  const exportExcel = () => {
    const wsData = [
      ["Email", "Customer", "Phone", "Location", "Status", "Date", "Total", "Profit"],
      ...filteredOrders.map(order => ([
        order.user,
        order.userName,
        order.userPhone,
        order.location,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
        order.total,
        calculateOrderProfit(order)
      ]))
    ];
    const summaryData = [
      [],
      ["Total", summary.total],
      ["Pending", summary.pending],
      ["Shipped", summary.shipped],
      ["Delivered", summary.delivered],
      ["Removed", summary.removed],
      ["Cancelled", summary.cancelled]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...wsData, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "order_report.xlsx");
  };

  const statusData = {
    labels: ["Pending", "Shipped", "Delivered", "Removed", "Cancelled"],
    datasets: [
      {
        label: "Order Count",
        data: [summary.pending, summary.shipped, summary.delivered, summary.removed, summary.cancelled],
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(156, 163, 175, 0.6)",
          "rgba(255, 99, 132, 0.6)"
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div >
        <Adminnaviagtion />
    <div className="order-report-container">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        📋 Order Summary Report </p>
      <div className="filters-section">
        <DatePicker selected={startDate} onChange={setStartDate} className="date-picker" placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} className="date-picker" placeholderText="End Date" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-dropdown">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="removed">Removed</option>
        </select>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" placeholder="Search customer" />
        <button onClick={fetchOrders} className="apply-filter-button">Apply Filters</button>
        {isFilterActive && (
  <button
    onClick={() => {
      setStartDate(null);
      setEndDate(null);
      setSearchQuery("");
      setStatusFilter("all");
      fetchOrders(); // fetch full unfiltered data
    }}
    className="clear-filter-button"
  >
    Clear Filters
  </button>
)}


      </div>

      <div className="summary-section">
        <div className="summary-card total">Total: {summary.total}</div>
        <div className="summary-card pending">Pending: {summary.pending}</div>
        <div className="summary-card shipped">Shipped: {summary.shipped}</div>
        <div className="summary-card delivered">Delivered: {summary.delivered}</div>
        <div className="summary-card removed">Removed: {summary.removed}</div>
        <div className="summary-card cancelled">Cancelled: {summary.cancelled}</div>
      </div>

      <div className="report-buttons">
            <button onClick={exportExcel} className="report-download-button"> <FaDownload />Download Excel</button>
            <button onClick={exportPDF} className="report-download-button"> <FaDownload />Download PDF</button>
          </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="order-report-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Customer</th>
                <th>Phone</th>
                <th style={{ maxWidth: "200px" }}>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Total</th>
                <th className="text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.user}</td>
                  <td>{order.userName}</td>
                  <td>{order.userPhone}</td>
                  <td title={order.location}>{order.location}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">Rs. {order.total.toFixed(2)}</td>
                  <td className="text-right">Rs. {calculateOrderProfit(order).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          
        </>
      )}

      <div className="chart-section">
        <h3 className="chart-title"> Order Status Distribution</h3>
        <Bar data={statusData} />
      </div>
    </div>
    </div>
  );
};

export default OrderReport;
