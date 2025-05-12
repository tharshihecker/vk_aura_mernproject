import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './List.css'; // Import the CSS file    
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component     

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]); // Define filteredPackages state
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredPackages(products); // Initialize filtered packages with all products on initial load
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (sku) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${sku}`);
        fetchProducts();
      } catch (error) {
        const msg = error.response?.data?.message || "Error deleting product";
        alert(`❌ ${msg}`);
      }
    }
  };

  const handleEdit = (sku) => {
    const productToEdit = products.find(product => product.sku === sku);
    navigate(`/edit-Product/${sku}`, { state: { product: productToEdit } });
  };


  const handlePrint = () => {
    const logoURL = "/logo.jpeg"; // Make sure this is in your public folder
    const newWindow = window.open('', '_blank');
  
    const productHTML = `
      <html>
        <head>
          <title>Product List - Vk Aura</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f6f8;
              margin: 0;
              padding: 40px;
            }
            .container {
              background-color: #fff;
              padding: 40px;
              max-width: 1100px;
              margin: auto;
              border-radius: 10px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .company-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-header img {
              height: 70px;
            }
            .company-header h1 {
              font-size: 32px;
              color: #374495;
              margin: 0;
            }
            h2 {
              text-align: center;
              color: #374495;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            thead {
              background-color: #f0f0f0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px 14px;
              text-align: center;
              font-size: 15px;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            tr:hover {
              background-color: #f1f1f1;
            }
            .totals {
              font-size: 18px;
              font-weight: bold;
              text-align: right;
              margin-top: 20px;
              background: #f9f9f9;
              padding: 12px;
              border: 1px solid #ccc;
              border-radius: 6px;
            }
            .button-group {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin-top: 40px;
            }
            .button {
              padding: 10px 24px;
              font-size: 16px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              transition: background 0.2s ease;
              color: white;
            }
            .cancel-btn { background-color: #e53935; }
            .cancel-btn:hover { background-color: #c62828; }
            .download-btn { background-color: #1e88e5; }
            .download-btn:hover { background-color: #1565c0; }
            .print-btn { background-color: #43a047; }
            .print-btn:hover { background-color: #2e7d32; }
          </style>
        </head>
        <body>
          <div class="container" id="product-content">
            <div class="company-header">
              <h1>Vk Aura</h1>
              <img src="${logoURL}" alt="Company Logo" />
            </div>
  
            <h2>📦 Product List</h2>
  
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Selling Price (₹)</th>
                  <th>Cost Price (₹)</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPackages.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${Number(product.sellingPrice).toFixed(2)}</td>
                    <td>${Number(product.costPrice).toFixed(2)}</td>
                    <td>${Number(product.quantity).toFixed(2)}</td>
                    <td>${product.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totals">
              Total Hand Stock Value: ₹${totalHandStockValue.toFixed(2)}
            </div>
  
            <div class="button-group">
              <button class="button cancel-btn" onclick="window.close()">❌ Cancel</button>
              <button class="button download-btn" onclick="downloadHTML()">📥 Download</button>
              <button class="button print-btn" onclick="window.print()">🖨️ Print Product List</button>
            </div>
          </div>
  
          <script>
            function downloadHTML() {
              const content = document.getElementById('product-content').outerHTML;
              const fullHTML = '<html><head><title>Product List</title></head><body>' + content + '</body></html>';
              const blob = new Blob([fullHTML], { type: 'text/html' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'product-list.html';
              link.click();
            }
          </script>
        </body>
      </html>
    `;
  
    newWindow.document.write(productHTML);
    newWindow.document.close();
  };
  

  const handleDownload = () => {
    const logoURL = "/logo.jpeg"; // Ensure this exists in /public
    const htmlContent = `
      <html>
        <head>
          <title>Product List - Vk Aura</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f6f8;
              margin: 0;
              padding: 40px;
            }
            .container {
              background-color: #fff;
              padding: 40px;
              border-radius: 10px;
              max-width: 1000px;
              margin: auto;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #ccc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #374495;
            }
            .header img {
              height: 70px;
            }
            h2 {
              text-align: center;
              margin-bottom: 30px;
              color: #374495;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px 14px;
              text-align: center;
              font-size: 15px;
            }
            thead {
              background-color: #f0f0f0;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .totals {
              font-size: 16px;
              font-weight: bold;
              background-color: #f9f9f9;
              padding: 14px;
              border-radius: 8px;
              border: 1px solid #ddd;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vk Aura</h1>
              <img src="${logoURL}" alt="Logo" />
            </div>
  
            <h2>📦 Product List</h2>
  
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Selling Price (₹)</th>
                  <th>Cost Price (₹)</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPackages.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${Number(product.sellingPrice).toFixed(2)}</td>
                    <td>${Number(product.costPrice).toFixed(2)}</td>
                    <td>${Number(product.quantity).toFixed(2)}</td>
                    <td>${product.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totals">
              Total Hand Stock Value: ₹${totalHandStockValue.toFixed(2)}
            </div>
          </div>
        </body>
      </html>
    `;
  
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Product-List-VkAura.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  
  
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = products.filter((pkg) =>
      pkg.name.toLowerCase().includes(value) || pkg.sku.toLowerCase().includes(value)
    );
    setFilteredPackages(filtered);
  };

  // Calculate the total hand stock value (costPrice * quantity)
  const totalHandStockValue = filteredPackages.reduce((acc, product) => {
    return acc + (Number(product.costPrice) * Number(product.quantity));
  }, 0);

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p> 
      <div className="main-content">
        <div>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Product List</p>
         
        <div style={{ 
  display: 'flex',  
  alignItems: 'center', 
  justifyContent: 'space-between',  
  width: '100%',  
  gap: '20px',
  marginBottom: '20px',
}}>

  <h3 style={{ margin: 0, color: '#374495' }}> Total Hand Stock Value: ₹{totalHandStockValue.toFixed(2)} </h3>

  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <input 
    placeholder="Search by package name or SKU"
    value={search}
    onChange={handleSearch}
    style={{ 
      width: "300px", 
      padding: "8px 12px", 
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
    }}
  />

  <button 
    onClick={handlePrint}
    style={{ 
      padding: "8px 16px", 
      backgroundColor: "#374495", 
      color: "white", 
      border: "none", 
      borderRadius: "6px", 
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    🖨️ Print
  </button>

  <button 
    onClick={handleDownload}
    style={{ 
      padding: "8px 16px", 
      backgroundColor: "#2196F3", 
      color: "white", 
      border: "none", 
      borderRadius: "6px", 
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    📥 Download
  </button>
</div>
</div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((product) => (
                <tr key={product.sku}>
                  <td>
                  <img src={product.image} alt="Product" style={{ width: "80px", height: "80px" }} />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.sellingPrice}</td>
                  <td>{product.costPrice}</td>
                  <td>{Number(product.quantity).toFixed(2)}</td>
                  <td>{product.unit}</td>
                  <td>
                    <button onClick={() => handleEdit(product.sku)} className="edit" 
                      style={{backgroundColor: "#1E88E5", color: "white" }}>
                      Edit
                    </button>
                     <button onClick={() => handleDelete(product.sku)} className="Delete">Delete</button> 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
