import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css';
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation';

const InvoiceList = ({ onSalesUpdate }) => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchInvoices();
  }, []);

  // Build product lookup (if needed for other purposes)
  const productLookup = useMemo(() => {
    return products.reduce((lookup, product) => {
      lookup[product._id.toString()] = product;
      return lookup;
    }, {});
  }, [products]);

  useEffect(() => {
    const totalSales = calculateTotalSales();
    if (typeof onSalesUpdate === 'function') {
      onSalesUpdate(totalSales);
    }
  }, [filteredInvoices, onSalesUpdate]);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      const fetchedInvoices = Array.isArray(response.data.invoices) ? response.data.invoices : [];
      setInvoices(fetchedInvoices);
      setFilteredInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${invoiceNumber}`);
        setInvoices((prev) =>
          prev.filter((invoice) => invoice.invoiceNumber !== invoiceNumber)
        );
        setFilteredInvoices((prev) =>
          prev.filter((invoice) => invoice.invoiceNumber !== invoiceNumber)
        );
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = invoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
    setFilteredInvoices(filtered);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Extracting only month and date for comparison
      const startMonth = start.getMonth();
      const startDay = start.getDate();
      const endMonth = end.getMonth();
      const endDay = end.getDate();
  
      if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
        alert("End date cannot be before the start date in the same month.");
        return;
      }
  
      const filteredByDate = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
  
      setFilteredInvoices(filteredByDate);
    }
  };
  
  const handlePrint = (invoice) => {
    const logoURL = "/logo.jpeg"; // Your uploaded logo
  
    const newWindow = window.open('', '_blank');
  
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background-color: #f2f2f2;
              display: flex;
              justify-content: center;
            }
            .container {
              background-color: #ffffff;
              border: 2px solid #ccc;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 30px;
              max-width: 850px;
              width: 100%;
              margin: auto;
            }
            .company-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .company-header img {
              width: 100px;
              height: auto;
              border: 1px solid #ccc;
              padding: 5px;
            }
            .company-header h1 {
              font-size: 28px;
              margin: 0;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              margin-bottom: 20px;
              border-top: 2px solid #333;
              padding-top: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #333;
            }
            th, td {
              padding: 12px;
              text-align: center;
            }
            .totals {
              text-align: right;
              font-size: 18px;
              margin-top: 20px;
            }
            .button-group {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin-top: 40px;
            }
            .print-btn, .cancel-btn, .download-btn {
              padding: 10px 25px;
              font-size: 18px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            }
            .print-btn {
              background-color: #4CAF50;
              color: white;
            }
            .cancel-btn {
              background-color: #f44336;
              color: white;
            }
            .download-btn {
              background-color: #2196F3;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container" id="invoice-content">
            <div class="company-header">
              <h1>Vk Aura</h1>
              <img src="${logoURL}" alt="Company Logo" />
            </div>
  
            <div class="invoice-details">
              <p><strong>Customer Name:</strong> ${invoice.customerName}</p>
              <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Rate (₹)</th>
                  <th>Quantity</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.rate.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.rate * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totals">
              <p><strong>Discount Applied:</strong> ${invoice.discount || 0}%</p>
              <p><strong>Total After Discount:</strong> ₹${invoice.amountAfterDiscount?.toFixed(2)}</p>
            </div>
  
            <div class="button-group">
              <button class="cancel-btn" onclick="window.close()">Cancel</button>
              <button class="download-btn" onclick="downloadHTML()">Download</button>
              <button class="print-btn" onclick="window.print()">Print Invoice</button>
            </div>
          </div>
  
          <script>
            function downloadHTML() {
              const element = document.getElementById('invoice-content');
              const htmlContent = '<html><head><title>Invoice</title></head><body>' + element.outerHTML + '</body></html>';
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'invoice.html';
              link.click();
            }
          </script>
        </body>
      </html>
    `;
  
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();
  };
  
  
  
  
  

  const calculateTotalSales = () => {
    return filteredInvoices.reduce(
      (total, invoice) => total + (invoice.amountAfterDiscount || 0),
      0
    );
  };

  const calculateTotalDiscount = () => {
    return filteredInvoices.reduce((totalDiscount, invoice) => {
      const invoiceTotal = invoice.items.reduce(
        (sum, item) => sum + (item.rate * (item.quantity || 0)),
        0
      );
      const discountForInvoice = invoiceTotal - (invoice.amountAfterDiscount || 0);
      return totalDiscount + discountForInvoice;
    }, 0);
  };

  const calculateTotalProfit = () => {
    return filteredInvoices.reduce((totalProfit, invoice) => {
      const totalCost = invoice.items.reduce((sum, item) => {
        // Use the costPrice stored in the invoice item
        const costPrice = item.costPrice || 0;
        return sum + costPrice * item.quantity;
      }, 0);
      const invoiceProfit = (invoice.amountAfterDiscount || 0) - totalCost;
      return totalProfit + invoiceProfit;
    }, 0);
  };

  const totalSales = calculateTotalSales();
  const totalDiscount = calculateTotalDiscount();
  const totalProfit = calculateTotalProfit();

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p> 
      <p><br></br></p> 


        <div className="main-content">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>Invoice List </p>

      

        <div className="filter-container">
        <div className="search-container" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Invoice Number"
            />
          </div>

          <div className="date-container">
          <input
              type="date"
              value={startDate}
              onChange={(e) => {
             setStartDate(e.target.value);
             setEndDate("");
             }}
             max={new Date().toISOString().split('T')[0]}
             placeholder="Start Date"
         />

<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  min={startDate} 
  max={new Date().toISOString().split('T')[0]}
  placeholder="End Date"
/>
<div>
  <button 
    onClick={() => {
      setStartDate('');
      setEndDate('');
      setSearchQuery('');
      setFilteredInvoices(invoices); 
    }}
    style={{ padding: "10px", width: '100px' }}
  >
    All
  </button>
</div>


          </div>
         
        </div>

        <div className="totals-container">
  <div className="totals-box">
    <h3>Total Sales</h3>
    <p>LKR{totalSales.toFixed(2)}</p>
  </div>
  <div className="totals-box">
    <h3>Total Discount</h3>
    <p>LKR{totalDiscount.toFixed(2)}</p>
  </div>
  <div className="totals-box">
    <h3>Total Profit</h3>
    <p>LKR{totalProfit.toFixed(2)}</p>
  </div>
</div>

      <div style={{ width: '100%', backgroundColor: 'white' }}>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString();
                  return (
                    <tr key={invoice._id || invoice.invoiceNumber}>
                      <td>{invoice.invoiceNumber || invoice._id}</td>
                      <td>{formattedDate}</td>
                      <td>{invoice.customerName}</td>
                      <td>₹{invoice.amountAfterDiscount?.toFixed(2)}</td>
                      <td>
                        <ul>
                          {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item, index) => (
                              <li key={index}>
                                {item.productName} -  {item.quantity} {item.unit} 
                                
                              </li>
                            ))
                          ) : (
                            <li>No products found</li>
                          )}
                        </ul>
                      </td>
                      



                      <td>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => handlePrint(invoice)}
      className="Print"
      style={{ backgroundColor: "#1E88E5", color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
    >
      Print
    </button>

    <button
      onClick={() => handleDelete(invoice.invoiceNumber)}
      className="Delete"
      style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
    >
      Delete
    </button>
  </div>
</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
