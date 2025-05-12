import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Upload, Select, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation"; // Import the Admin Navigation Component

const { Option } = Select;

const AddPackage = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // Added preview state
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const navigate = useNavigate();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      message.error("Failed to load products");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cleanup URL.createObjectURL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (values) => {
    if (!image) return message.error("Please upload an image");
  
    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("discount", discount);
    formData.append("image", image);
    formData.append("products", JSON.stringify(selectedProducts));
  
    try {
      await axios.post("http://localhost:5000/api/packages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Package added successfully");
      navigate("/packages");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error submitting package";
      message.error(`❌ ${errMsg}`);
    }
  };

  // Add new product row
  const addProductRow = () => {
    setSelectedProducts((prev) => [
      ...prev,
      { productId: "", name: "", unit: "", sellingPrice: 0, quantity: 1 },
    ]);
  };

  // Update product selection
  const handleProductChange = (index, id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    setSelectedProducts((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index] = {
        productId: id,
        name: product.name,
        unit: product.unit,
        sellingPrice: product.sellingPrice,
        quantity: 1,
      };
      calculatePrices(updatedProducts, discount);
      return updatedProducts;
    });
  };

  const handleQuantityChange = (index, quantity) => {
    const currentProduct = selectedProducts[index];
    const unit = currentProduct?.unit;
  
    // Trim spaces and validate for empty
    if (quantity === "") {
      updateQuantity(index, quantity);
      return;
    }
  
    // Validate based on unit
    if (unit === "kg") {
      // Allow decimal up to 2 digits
      if (/^\d*\.?\d{0,2}$/.test(quantity)) {
        if (parseFloat(quantity) <= 1000) {
          updateQuantity(index, quantity);
        }
      }
    } else if (unit === "pcs") {
      // Only allow whole numbers
      if (/^\d+$/.test(quantity)) {
        if (parseInt(quantity) <= 1000) {
          updateQuantity(index, quantity);
        }
      }
    }
  };
  
  // Helper function to set quantity and recalculate prices
  const updateQuantity = (index, quantity) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      calculatePrices(updated, discount);
      return updated;
    });
  };
  

  // Remove product row
  const removeProductRow = (index) => {
    setSelectedProducts((prev) => {
      const updatedProducts = prev.filter((_, i) => i !== index);
      calculatePrices(updatedProducts, discount);
      return updatedProducts;
    });
  };

  // Update discount and recalculate prices
  const handleDiscountChange = (value) => {
    const discountValue = parseFloat(value) || 0;
    setDiscount(discountValue);
    calculatePrices(selectedProducts, discountValue);
  };

  // Calculate total and final price dynamically
  const calculatePrices = (selected, discount) => {
    let total = selected.reduce(
      (sum, item) => sum + item.sellingPrice * (item.quantity || 0),
      0
    );
    let final = total - total * (discount / 100);
    setTotalPrice(total);
    setFinalPrice(final);
  };

  return (
    <div className="admin-dashboard-container" style={{width:'600px'}}>
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>
      <div className="main-content">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Add Package</p>
        
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item  style={{width:'600px'}}
            name="name"
            label="Package Name"
            rules={[{ required: true, message: "Enter package name" },
              { min: 4, message: "Package name must be at least 4 characters." },
              { max: 25, message: "Package name cannot exceed 25 characters." },
            ]}
          >
            <Input placeholder="Enter package name"  minLength={4}/>
          </Form.Item>

          <Button
  type="dashed"
  onClick={addProductRow}
  style={{ marginBottom: 20 , backgroundColor: "#1E88E5", color: "white"}}
>
  + Add Product
</Button>

{selectedProducts.map((item, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: 10,
    }}
  >
    <Select
      showSearch
      style={{ width: "40%" }}
      value={item.productId || undefined}
      placeholder="Search and select product"
      onChange={(value) => handleProductChange(index, value)}
      filterOption={(input, option) =>
        option.children
          ?.toString()
          ?.toLowerCase()
          ?.includes(input.toLowerCase())
      }
    >
      {products.map((product) => {
        // Disable option if product is already selected in another row.
        const isSelected = selectedProducts.some(
          (selected, idx) => selected.productId === product._id && idx !== index
        );
        return (
          <Option
            key={product._id}
            value={product._id}
            disabled={isSelected}
          >
            {`${product.name || ""} - ${product.sku || ""}`}
          </Option>
        );
      })}
    </Select>

              <span>{item.unit}</span>
              <span>Rs. {item.sellingPrice || 0}</span>

              <Input
                type="text"
                value={item.quantity === "" ? "" : item.quantity}
                onChange={(e) =>
                  handleQuantityChange(index, e.target.value)
                }
                placeholder="Enter quantity"
                style={{ width: "100px" }}
              />

              <Button type="link" danger onClick={() => removeProductRow(index)}>
                Remove
              </Button>
            </div>
          ))}

          <Form.Item label="Discount">
            <Input
              type="text"
              value={discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="Enter discount %"
            />
          </Form.Item>

          <Form.Item label="Total Price">
            <Input value={totalPrice} readOnly />
          </Form.Item>

          <Form.Item label="Final Price">
            <Input value={finalPrice} readOnly />
          </Form.Item>
          




          <Form.Item
  label="Upload Image"
  required
  validateStatus={!image ? "error" : "success"}
  help={!image ? "Please upload an image" : ""}
>
  <Upload
    beforeUpload={(file) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
      if (!isJpgOrPng) {
        message.error("Only JPG, JPEG, and PNG files are allowed!");
        return Upload.LIST_IGNORE;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      return false;
    }}
    showUploadList={false}
  >
    <Button style={{width:'600px'}}>Browse Image</Button>
  </Upload>

  {preview && (
    <img
      src={preview}
      alt="Preview"
      style={{
        marginLeft: "10px",
        maxWidth: "600px",
        marginTop: "10px",
        display: "block",
        borderRadius: "8px",
      }}
    />
  )}
</Form.Item>

          

          <Form.Item >
          <Button style={{ backgroundColor: "#1E88E5", color: "white",width:'600px'}} type="primary" htmlType="submit">
           Add Package
          </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddPackage;
