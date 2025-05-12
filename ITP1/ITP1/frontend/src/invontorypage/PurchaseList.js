import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css'; 
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Admin Navigation Component

const PurchaseList = ({ onPurchasesUpdate }) => {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate]);
  

  useEffect(() => {
    // When purchases are filtered, update the total purchases value
    const totalPurchases = calculateTotalPurchases();
    if (typeof onPurchasesUpdate === 'function') {
      onPurchasesUpdate(totalPurchases);
    } else {
      console.warn('onPurchasesUpdate is not a function');
    }
  }, [filteredPurchases, onPurchasesUpdate]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchases');
      const data = response.data.purchases || [];
      setPurchases(data);
      setFilteredPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleDelete = async (purchaseNumber) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/purchases/${purchaseNumber}`);
        setPurchases((prev) =>
          prev.filter((purchase) => purchase.purchaseNumber !== purchaseNumber)
        );
        setFilteredPurchases((prev) =>
          prev.filter((purchase) => purchase.purchaseNumber !== purchaseNumber)
        );
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = purchases.filter((purchase) =>
      purchase.purchaseNumber.toLowerCase().includes(query)
    );
    setFilteredPurchases(filtered);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      const filteredByDate = purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
      });
      setFilteredPurchases(filteredByDate);
    }
  };


  const handlePrint = (purchase) => {
    const logoURL = "/logo.jpeg"; 
  
    const newWindow = window.open('', '_blank');
  
    const purchaseHTML = `
      <html>
        <head>
          <title>Purchase Order - ${purchase.purchaseNumber}</title>
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
            .purchase-details {
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
              background-color: #1E88E5;
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
          <div class="container" id="purchase-content">
            <div class="company-header">
              <h1>Vk Aura</h1>
              <img src="${logoURL}" alt="Company Logo" />
            </div>
  
            <div class="purchase-details">
              <p><strong>Supplier Name:</strong> ${purchase.supplierName}</p>
              <p><strong>Purchase Date:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString()}</p>
              <p><strong>Purchase Number:</strong> ${purchase.purchaseNumber}</p>
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Cost Price (₹)</th>
                  <th>Quantity</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${purchase.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.costPrice ? Number(item.costPrice).toFixed(2) : "0.00"}</td>
                    <td>${item.quantity}</td>
                    <td>${(Number(item.costPrice || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totals">
              <p><strong>Total Purchase Value:</strong> ₹${purchase.items.reduce((sum, item) => sum + (Number(item.costPrice || 0) * Number(item.quantity || 0)), 0).toFixed(2)}</p>
            </div>
  
            <div class="button-group">
              <button class="cancel-btn" onclick="window.close()">Cancel</button>
              <button class="download-btn" onclick="downloadHTML()">Download</button>
              <button class="print-btn" onclick="window.print()">Print Purchase Order</button>
            </div>
          </div>
  
          <script>
            function downloadHTML() {
              const element = document.getElementById('purchase-content');
              const htmlContent = '<html><head><title>Purchase Order</title></head><body>' + element.outerHTML + '</body></html>';
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'purchase-order.html';
              link.click();
            }
          </script>
        </body>
      </html>
    `;
  
    newWindow.document.write(purchaseHTML);
    newWindow.document.close();
  };
  
  
  // Calculate the total purchase value as the sum of (costPrice * quantity) for each item in every purchase order.
  const calculateTotalPurchases = () => {
    return filteredPurchases.reduce((total, purchase) => {
      const purchaseTotal = purchase.items.reduce((sum, item) => {
        // Use item.costPrice (or fallback to 0) multiplied by quantity.
        return sum + (Number(item.costPrice || 0) * Number(item.quantity || 0));
      }, 0);
      return total + purchaseTotal;
    }, 0);
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p> 
      <div className="main-content">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Purchase Orders List</p>

      <div className="filter-container">
        <div className="create-purchase-container">
          <p></p>
          <div className="search-container" >
            <input
            style={{width: "400px"}}
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Purchase Order Number"
            />
          </div>
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
    style={{marginTop:'15px'}}
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    min={startDate} 
    max={new Date().toISOString().split('T')[0]} 
    placeholder="End Date"
    disabled={!startDate} 
    style={{marginTop:'15px'}}
  />

  <div>
    <button 
      onClick={() => {
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setFilteredPurchases(purchases); // Reset all
      }}
      style={{ padding: "10px", width: "100px" }}
    >
      All
    </button>
  </div>
</div>



        </div>
        <div className="total-sales">
          <h3>Total Purchases: ₹{calculateTotalPurchases().toFixed(2)}</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Purchase Number</th>
              <th>Purchase Date</th>
              <th>Supplier Name</th>
              <th>Total (Calculated)</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => {
                const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString();
          
                const purchaseTotal = purchase.items.reduce((sum, item) => {
                  return sum + (Number(item.costPrice || 0) * Number(item.quantity || 0));
                }, 0);
                return (
                  <tr key={purchase.purchaseNumber}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>{formattedDate}</td>
                    <td>{purchase.supplierName}</td>
                    <td>₹{purchaseTotal.toFixed(2)}</td>
                    <td>
                      <ul>
                        {purchase.items && purchase.items.length > 0 ? (
                          purchase.items.map((item, index) => (
                            <li key={index}>
                              {item.productName} - {item.quantity} {item.unit} 
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
      onClick={() => handlePrint(purchase)}
      style={{
        backgroundColor: "#1E88E5",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      Print
    </button>

    <button
      onClick={() => handleDelete(purchase.purchaseNumber)}
      style={{
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer"
      }}
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
                <td colSpan="6" className="no-data">No purchase orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList;
