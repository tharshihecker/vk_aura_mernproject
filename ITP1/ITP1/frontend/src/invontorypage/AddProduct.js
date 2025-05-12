import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "antd";
import { message } from "antd"; 
import "./AddProduct.css";
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const AddProduct = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  

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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (name.length < 4 || name.length > 25) {
      setErrorMessage("Product name must be between 4 and 25 characters.");
      return; 
    }
  
    if (sku.length < 4 || sku.length > 25) {
      setErrorMessage("SKU must be between 4 and 25 characters.");
      return; 
    }

    if (parseFloat(sellingPrice) <= parseFloat(costPrice)) {
      setErrorMessage("Selling price must be greater than cost price.");
      return;
    } else {
      setErrorMessage(""); // Ensure error message is cleared
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
      const response = await axios.post("http://localhost:5000/api/products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // If the product is added successfully
      message.success("Product added successfully");
      navigate("/product-list");
    } catch (error) {
      // Capture specific error from the backend
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message); // Display "SKU already exists" message
      } else {
        setErrorMessage("An error occurred. Please try again."); // Fallback for unknown errors
      }
  
      message.error("Error saving product. Check the input or try again.");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value); // Always update state first
    if (value.length < 4 || value.length > 25) {
      setErrorMessage("Product name must be between 4 and 25 characters.");
    } else {
      setErrorMessage(""); // Clear error message if valid
    }
  };
  
  const handleSkuChange = (e) => {
    const value = e.target.value;
    setSku(value); // Always update state first
    if (value.length < 4 || value.length > 25) {
      setErrorMessage("SKU must be between 4 and 25 characters.");
    } else {
      setErrorMessage(""); // Clear error message if valid
    }
  };

  const doublevalue123 = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setter(value);
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

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    setQuantity(""); // Reset quantity when unit changes
  };




  

  return (

    <div className="admin-dashboard-container">
      <Adminnaviagtion /> 
      <p><br></br></p>  <p><br></br></p> 

      <div className="main-content">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>Add Product</p>
  
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
              onChange={handleNameChange}
              placeholder="Product Name"
              required
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={handleSkuChange}
              placeholder="SKU"
              required
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
            <Input
              type="text"
              value={quantity}
              onChange={doublevalue(setQuantity)}
              placeholder="Quantity"
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select value={unit} onChange={handleUnitChange}>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            Add Product
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddProduct;
