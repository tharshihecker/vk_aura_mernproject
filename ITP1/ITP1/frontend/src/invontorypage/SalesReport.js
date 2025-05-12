import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnaviagtion from '../Component/Adminnavigation';
import "../styles/Body.css";
import './List.css'; 

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [invoiceRes, orderRes, productRes, packageRes] = await Promise.all([
        axios.get('http://localhost:5000/api/invoices'),
        axios.get('http://localhost:5000/api/admin/bookings', { headers }),
        axios.get('http://localhost:5000/api/products', { headers }),
        axios.get('http://localhost:5000/api/packages', { headers }),
      ]);

      setInvoices(invoiceRes.data.invoices || []);
      setOrders(orderRes.data || []);
      setProducts(productRes.data || []);
      setPackages(packageRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };


  const isWithinRange = (dateStr) => {
    const date = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const month = selectedMonth ? parseInt(selectedMonth) : null;
    const year = selectedYear ? parseInt(selectedYear) : null;
  

    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
    const endOnly = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;
  
    if (startOnly && endOnly) {
      return itemDate >= startOnly && itemDate <= endOnly;
    } else if (month !== null && year !== null) {
      return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    }
    return true;
  };
  

  const filteredInvoices = invoices.filter(inv => isWithinRange(inv.invoiceDate));
  const deliveredOrders = orders.filter(o => o.status === 'delivered' && isWithinRange(o.createdAt));

  const calculateInvoiceProfit = (invoice) => {
    const totalCost = (invoice.items || []).reduce((sum, item) => sum + (item.costPrice || 0) * (item.quantity || 1), 0);
    return (invoice.amountAfterDiscount || 0) - totalCost;
  };

  const calculateOrderProfit = (order) => {
    let profit = 0;
  
    (order.items || []).forEach(item => {
      
      if (!item.products || item.products.length === 0) {
        return;
      }
  
      
      item.products.forEach(prod => {
        const quantity = Number(prod.quantity || 0);
        const cost = Number(prod.costPriceAtOrder || 0);
        const sell = Number(prod.sellingPriceAtOrder || 0);
        const unitsSold = quantity * (item.quantity || 1);
        profit += (sell - cost) * unitsSold;
      });
  
      
      const discount = ((item.price || 0) - (item.finalPrice || 0)) * (item.quantity || 1);
      profit -= discount;
    });
  
    return profit;
  };
  


  const getReportPeriod = () => {
    if (startDate && endDate) {
      return `Report Period: ${new Date(startDate).toLocaleDateString()} ➔ ${new Date(endDate).toLocaleDateString()}`;
    } else if (selectedMonth !== '' && selectedYear !== '') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `Report Period: ${months[selectedMonth]} ${selectedYear}`;
    } else {
      return `Full Report (All Time)`;
    }
  };



  const handlePrint = () => {
    const logoURL = "/logo.jpeg"; // Must be in public folder
    const newWindow = window.open('', '_blank');
  
    const html = `
      <html>
      <head>
        <title>Sales Report - Vk Aura</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 40px;
          }
          .container {
            background-color: #ffffff;
            padding: 30px 40px;
            border-radius: 12px;
            max-width: 1200px;
            margin: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #ccc;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header img {
            height: 70px;
          }
          .header h2 {
            font-size: 32px;
            color: #374495;
            margin: 0;
          }
          h3 {
            color: #374495;
            margin-top: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 6px;
          }
          .summary p {
            font-size: 16px;
            margin: 8px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          table thead {
            background-color: #f0f0f0;
          }
          th, td {
            padding: 10px 12px;
            border: 1px solid #ddd;
            text-align: center;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          .button-group {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 40px;
          }
          .button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            color: white;
          }
          .cancel-btn { background-color: #f44336; }
          .download-btn { background-color: #2196F3; }
          .print-btn { background-color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Vk Aura - Sales Report</h2>
            <img src="${logoURL}" alt="Logo" />
          </div>
  
          <h3>${getReportPeriod()}</h3>
  
          <div class="summary">
            <p><strong>Invoice Sales:</strong> Rs ${invoiceSales.toFixed(2)}</p>
            <p><strong>Invoice Profit:</strong> Rs ${invoiceProfit.toFixed(2)}</p>
            <p><strong>Package Sales:</strong> Rs ${packageSales.toFixed(2)}</p>
            <p><strong>Package Profit:</strong> Rs ${packageProfit.toFixed(2)}</p>
            <p><strong>Total Sales:</strong> Rs ${(invoiceSales + packageSales).toFixed(2)}</p>
            <p><strong>Total Profit:</strong> Rs ${(invoiceProfit + packageProfit).toFixed(2)}</p>
          </div>
  
          <h3>🧾 Invoice Details</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Profit</th>
                <th>Invoice Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices.length === 0
                ? `<tr><td colspan="5">No Invoices</td></tr>`
                : filteredInvoices.map(inv => `
                  <tr>
                    <td>${inv.invoiceNumber}</td>
                    <td>${inv.customerName}</td>
                    <td>Rs ${inv.amountAfterDiscount?.toFixed(2)}</td>
                    <td>Rs ${calculateInvoiceProfit(inv).toFixed(2)}</td>
                    <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
  
          <h3>📦 Delivered Package Details</h3>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Package Total</th>
                <th>Profit</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              ${deliveredOrders.length === 0
                ? `<tr><td colspan="4">No Delivered Orders</td></tr>`
                : deliveredOrders.map(order => `
                  <tr>
                    <td>${order.userName}</td>
                    <td>Rs ${order.total?.toFixed(2)}</td>
                    <td>Rs ${calculateOrderProfit(order).toFixed(2)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
  
          <div class="button-group">
            <button class="button cancel-btn" onclick="window.close()">❌ Cancel</button>
            <button class="button download-btn" onclick="downloadHTML()">📥 Download</button>
            <button class="button print-btn" onclick="window.print()">🖨️ Print</button>
          </div>
        </div>
  
        <script>
          function downloadHTML() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Sales-Report-VkAura.html';
            link.click();
          }
        </script>
      </body>
      </html>
    `;
  
    newWindow.document.write(html);
    newWindow.document.close();
  };
  
  

  const handleDownload = () => {
    const logoURL = "/logo.jpeg"; // Logo must be in the public folder
  
    const html = `
      <html>
        <head>
          <title>Sales Report - Vk Aura</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              padding: 40px;
              margin: 0;
            }
            .container {
              background-color: #fff;
              border-radius: 8px;
              padding: 40px;
              max-width: 1000px;
              margin: auto;
              box-shadow: 0 0 15px rgba(0,0,0,0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .header img {
              height: 80px;
            }
            h2, h3 {
              color: #374495;
              text-align: center;
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
            .summary {
              margin-top: 30px;
              font-size: 16px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Vk Aura - Sales Report</h2>
              <img src="${logoURL}" alt="Logo" />
            </div>
  
            <h3>${getReportPeriod()}</h3>
  
            <div class="summary">
              <p><strong>Invoice Sales:</strong> Rs ${invoiceSales.toFixed(2)}</p>
              <p><strong>Invoice Profit:</strong> Rs ${invoiceProfit.toFixed(2)}</p>
              <p><strong>Package Sales:</strong> Rs ${packageSales.toFixed(2)}</p>
              <p><strong>Package Profit:</strong> Rs ${packageProfit.toFixed(2)}</p>
              <p><strong>Total Sales:</strong> Rs ${(invoiceSales + packageSales).toFixed(2)}</p>
              <p><strong>Total Profit:</strong> Rs ${(invoiceProfit + packageProfit).toFixed(2)}</p>
            </div>
  
            <h3>🧾 Invoice Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Profit</th>
                  <th>Invoice Date</th>
                </tr>
              </thead>
              <tbody>
                ${filteredInvoices.length === 0 ? `
                  <tr><td colspan="5">No Invoices</td></tr>
                ` : filteredInvoices.map(inv => `
                  <tr>
                    <td>${inv.invoiceNumber}</td>
                    <td>${inv.customerName}</td>
                    <td>Rs ${inv.amountAfterDiscount?.toFixed(2)}</td>
                    <td>Rs ${calculateInvoiceProfit(inv).toFixed(2)}</td>
                    <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <h3>📦 Delivered Package Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Package Total</th>
                  <th>Profit</th>
                  <th>Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                ${deliveredOrders.length === 0 ? `
                  <tr><td colspan="4">No Delivered Orders</td></tr>
                ` : deliveredOrders.map(order => `
                  <tr>
                    <td>${order.userName}</td>
                    <td>Rs ${order.total?.toFixed(2)}</td>
                    <td>Rs ${calculateOrderProfit(order).toFixed(2)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  
    const blob = new Blob([html], { type: 'text/html' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'Sales-Report-VkAura.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  



  const invoiceSales = filteredInvoices.reduce((sum, inv) => sum + (inv.amountAfterDiscount || 0), 0);
  const invoiceProfit = filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);
  const packageSales = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const packageProfit = deliveredOrders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>  <p><br></br></p>
      <div className="main-content">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      📊 Sales Report </p>
     


        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
  
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' ,marginTop: '20px' }}>
    <label>Start Date:</label>
    <input 
      type="date" 
      value={startDate} 
      onChange={e => { setStartDate(e.target.value); setSelectedMonth(''); setSelectedYear(''); }} 
      max={today} 
      style={{ padding: '10px', minWidth: '120px' }}
    />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start',marginTop: '20px' }}>
    <label>End Date:</label>
    <input 
      type="date" 
      value={endDate} 
      onChange={e => { setEndDate(e.target.value); setSelectedMonth(''); setSelectedYear(''); }} 
      max={today}  min={startDate}
      style={{ padding: '10px', minWidth: '120px' }}
    />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start',marginTop: '20px' }}>
    <label>Month:</label>
    <select 
      value={selectedMonth} 
      onChange={(e) => { setSelectedMonth(e.target.value); setStartDate(''); setEndDate(''); }}
      style={{ padding: '10px', minWidth: '120px' }}
    >
      <option value="">Select Month</option>
      {months.map((month, index) => (
        <option key={index} value={index}>{month}</option>
      ))}
    </select>
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' ,marginTop: '20px'}}>
    <label>Year:</label>
    <select 
      value={selectedYear} 
      onChange={(e) => { setSelectedYear(e.target.value); setStartDate(''); setEndDate(''); }}
      style={{ padding: '10px', minWidth: '120px' }}
    >
      <option value="">Select Year</option>
      {Array.from({ length: currentYear - 2020 }, (_, i) => currentYear - i).map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>

  <button 
    style={{ 
      padding: '10px', 
      marginTop: '35px',
      minWidth: '120px',  
      color: 'white', 
      alignItems: 'center',
      justifyContent: 'center'
    }} 
    onClick={handlePrint}
  >
    🖨️ Print
  </button>
  <button 
    style={{ 
      padding: '10px', 
      marginTop: '35px',
      minWidth: '120px',  
      color: 'white', 
      alignItems: 'center',
      justifyContent: 'center'
    }} 
    onClick={handleDownload}
  >
    📥 Download
  </button>

</div>

        <div className="totals-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div className="totals-box">
            <h3 >Invoice Sales</h3>
            <p>Rs {invoiceSales.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Invoice Profit</h3>
            <p>Rs {invoiceProfit.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Package Sales</h3>
            <p>Rs {packageSales.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Package Profit</h3>
            <p>Rs {packageProfit.toFixed(2)}</p>
          </div>
        </div>

        <div className="totals-container" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <div className="totals-box">
            <h3>Total Sales</h3>
            <p>Rs {(invoiceSales + packageSales).toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Total Profit</h3>
            <p>Rs {(invoiceProfit + packageProfit).toFixed(2)}</p>
          </div>
        </div>


        <h3 style={{ marginTop: '30px', color: '#374495' }}>🧾 Invoice Details</h3>
        <table style={{ width: '100%', tableLayout: 'auto', backgroundColor: 'white', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Profit</th>
              <th>Invoice Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No Invoices</td></tr> :
              filteredInvoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.customerName}</td>
                  <td>Rs {inv.amountAfterDiscount?.toFixed(2)}</td>
                  <td>Rs {calculateInvoiceProfit(inv).toFixed(2)}</td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>

  
        <h3 style={{ marginTop: '30px', color: '#374495' }}>📦 Delivered Package Details</h3>
        <table style={{ width: '100%', tableLayout: 'auto', backgroundColor: 'white', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Package Total</th>
              <th>Profit</th>
              <th>Delivery Date</th>
            </tr>
          </thead>
          <tbody>
            {deliveredOrders.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>No Delivered Orders</td></tr> :
              deliveredOrders.map(order => (
                <tr key={order._id}>
                  <td>{order.userName}</td>
                  <td>Rs {order.total?.toFixed(2)}</td>
                  <td>Rs {calculateOrderProfit(order).toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
