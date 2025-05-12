import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Make sure useLocation is imported
import axios from "axios";
import { Input } from "antd";
import { message } from "antd";
import "./AddProduct.css";
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const EditProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editProduct = location.state?.product || null;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setSku(editProduct.sku);
      setSellingPrice(editProduct.sellingPrice);
      setCostPrice(editProduct.costPrice);
      setQuantity(editProduct.quantity);
      setUnit(editProduct.unit);
      setPreviewImage(editProduct.image ? editProduct.image : null); 
    }
  }, [editProduct]);

 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
      if (!allowedTypes.includes(fileType)) {
        setErrorMessage("Only JPG, JPEG, and PNG files are allowed.");
        setImage(null);
        setPreviewImage(null);
        return;
      }
  
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrorMessage(""); // Clear error if valid
    }
  };
  


  const doublevalue = (setter) => (e) => {
    const value = e.target.value;
  
    if (unit === "kg") {
      if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        if (parseFloat(value) <= 1000 || value === "") {
          setter(value);
        }
      }
    } else if (unit === "pcs") {
      if (/^\d*$/.test(value) || value === "") {
        if (parseInt(value) <= 1000 || value === "") {
          setter(value);
        }
      }
    }
  };


  const doublevalue123 = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setter(value);
    }
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    setQuantity(""); // Reset quantity when unit changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    
    if (name.length < 4 || name.length > 25) {
      setErrorMessage("Product name must be between 4 and 25 characters.");
      return; 
    }
  
   

    if (parseFloat(sellingPrice) <= parseFloat(costPrice)) {
      setErrorMessage("Selling price must be greater than cost price.");
      return;
    }



    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("sellingPrice", sellingPrice);
    formData.append("costPrice", costPrice);
    formData.append("quantity", quantity);
    formData.append("unit", unit);

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.put(`http://localhost:5000/api/products/${sku}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Product updated successfully");
      navigate("/product-list");
    } catch (error) {
      message.error("Error saving product. Check the input or try again.");
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="admin-dashboard-container">
    <Adminnaviagtion /> 
    <p><br></br></p>  <p><br></br></p> 

    <div className="main-content">

    <div className="form-container">
    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
    Edit Product</p>
   
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="form-content">
        <div className="image-upload">
          <label htmlFor="file-upload" className="image-label">
            Browse Photo
          </label>
          <input id="file-upload" type="file" onChange={handleImageChange} style={{ display: "none" }} />

          <div className="image-placeholder">
            {previewImage ? (
              <img src={previewImage} alt="Preview" />
            ) : (
              <div className="empty-placeholder">No Image</div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              required
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="text"
              value={sellingPrice}
              onChange={doublevalue123(setSellingPrice)}
              placeholder="Selling Price"
              required
            />
          </div>

          <div className="form-group">
            <label>Cost Price</label>
            <input
              type="text"
              value={costPrice}
              onChange={doublevalue123(setCostPrice)}
              placeholder="Cost Price"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            {quantity ? parseFloat(quantity).toFixed(2) : ""}
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select value={unit} onChange={handleUnitChange}>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <button style={{ backgroundColor: "#1E88E5", color: "white" }} type="submit" className="submit-button">
            Update Product
          </button>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
};

export default EditProduct;
