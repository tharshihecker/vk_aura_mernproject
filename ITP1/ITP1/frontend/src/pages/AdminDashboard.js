import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Component/Adminnavigation';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../styles/Body.css";
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const handleStartDateChange = (value) => {
    setStartDate(value);

    if (value > today) {
      setStartDateError("Start date cannot be after today");
    } else if (endDate && new Date(value) > new Date(endDate)) {
      setStartDateError("Start date cannot be after end date");
      setEndDateError("");
    } else {
      setStartDateError("");
      setEndDateError("");
    }
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);

    if (value > today) {
      setEndDateError("End date cannot be after today");
    } else if (startDate && new Date(value) < new Date(startDate)) {
      setEndDateError("End date cannot be before start date");
      setStartDateError("");
    } else {
      setEndDateError("");
      setStartDateError("");
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStartDateError('');
    setEndDateError('');
    fetchInvoiceData();
    fetchPackageData();
  };

  const [invoiceSales, setInvoiceSales] = useState(0);
  const [invoiceProfit, setInvoiceProfit] = useState(0);
  const [packageSales, setPackageSales] = useState(0);
  const [packageProfit, setPackageProfit] = useState(0);

  useEffect(() => {
    if (startDateError || endDateError) return;
    fetchInvoiceData();
    fetchPackageData();
  }, [startDate, endDate, startDateError, endDateError]);

  const fetchInvoiceData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/invoices');
      const invoices = data.invoices || [];
      const filtered = filterByDate(invoices, 'invoiceDate');

      let totalSales = 0;
      let totalProfit = 0;

      filtered.forEach(inv => {
        const sale = inv.amountAfterDiscount || 0;
        totalSales += sale;
        const cost = (inv.items || []).reduce((sum, item) => sum + (item.costPrice || 0) * (item.quantity || 1), 0);
        totalProfit += sale - cost;
      });

      setInvoiceSales(totalSales);
      setInvoiceProfit(totalProfit);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchPackageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [ordersRes, productsRes, packagesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/bookings', { headers }),
        axios.get('http://localhost:5000/api/products', { headers }),
        axios.get('http://localhost:5000/api/packages', { headers }),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const packs = packagesRes.data || [];

      calculatePackageSalesAndProfit(orders, products, packs);
    } catch (err) {
      console.error('Error fetching package data:', err);
    }
  };

  const calculatePackageSalesAndProfit = (orders, products, packs) => {
    let sales = 0;
    let profit = 0;
  
    const delivered = (orders || []).filter(o => o.status === 'delivered');
    const filtered = filterByDate(delivered, 'createdAt');
  
    filtered.forEach(order => {
      sales += order.total || 0;
  
      (order.items || []).forEach(item => {
        // 🛑 Skip profit if no historical pricing
        if (!item.products || item.products.length === 0) return;
  
        let itemProfit = 0;
        item.products.forEach(prod => {
          const quantity = Number(prod.quantity || 0);
          const cost = Number(prod.costPriceAtOrder || 0);
          const sell = Number(prod.sellingPriceAtOrder || 0);
          const unitProfit = (sell - cost) * quantity * (item.quantity || 1);
          itemProfit += unitProfit;
        });
  
        // ✅ Calculate discount from item price - finalPrice
        const discount = ((item.price || 0) - (item.finalPrice || 0)) * (item.quantity || 1);
        profit += itemProfit - discount;
      });
    });
  
    setPackageSales(sales);
    setPackageProfit(profit);
  };
  

  const filterByDate = (arr, field) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    return arr.filter(item => {
      const d = new Date(item[field]);
      const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Only date part
      const startOnly = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
      const endOnly = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;
  
      return (!startOnly || itemDate >= startOnly) && (!endOnly || itemDate <= endOnly);
    });
  };

  const barChartData = {
    labels: ['Invoice Sales', 'Invoice Profit', 'Package Sales', 'Package Profit'],
    datasets: [
      {
        label: 'Amount Rs',
        data: [
          Number(invoiceSales || 0),
          Number(invoiceProfit || 0),
          Number(packageSales || 0),
          Number(packageProfit || 0)
        ],
        backgroundColor: ['#36A2EB', '#4bc0c0', '#FFCE56', '#FF6384'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Rs ${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `Rs ${value}`;
          }
        }
      }
    }
  };

  return (
    <>
      <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="admin-dashboard" style={{ marginTop: '100px',marginLeft:'400px' }}>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
       WELCOME TO THE ADMIN DASHBOARD </p>
        

        <div className="date-filter-row" style={{ gap: '100px'}}>
          <div className="date-field">
            <label style={{marginTop:"0px"}}><strong>Start Date:</strong></label>
            <input style={{height:'35px'}} type="date" value={startDate} max={today} onChange={e => handleStartDateChange(e.target.value)} />
            
          </div>

          <div className="date-field">
            <label><strong>End Date:</strong></label>
            <input style={{height:'35px'}} type="date" value={endDate} min={startDate} max={today} onChange={e => handleEndDateChange(e.target.value)} />
            
          </div>

          <button   onClick={clearFilters} className="clear-btn">All Data</button>
        </div>

        <div className="summary-row">

        <div className="totals-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div className="totals-box">
            <h3 style={{fontSize: '30px'}}>Invoice Summary</h3>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Invoice Sales: Rs {invoiceSales.toFixed(2)}</p>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Invoice Profit: Rs {invoiceProfit.toFixed(2)}</p>
          </div>

          <div className="totals-box">
            <h3 style={{fontSize: '30px'}}>Package Summary</h3>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Package Sales: Rs {packageSales.toFixed(2)}</p>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Package Profit: Rs {packageProfit.toFixed(2)}</p>
          </div>

          <div className="totals-box">
            <h3 style={{fontSize: '30px'}}>Total Summary</h3>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Sales: Rs {(invoiceSales + packageSales).toFixed(2)}</p>
            <p style={{fontSize: '15px',marginTop:'30px'}}>Total Profit: Rs {(invoiceProfit + packageProfit).toFixed(2)}</p>
          </div>
        </div>
        </div>

        <div className="chart-box full-width">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Sales & Profit Comparison</p>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
