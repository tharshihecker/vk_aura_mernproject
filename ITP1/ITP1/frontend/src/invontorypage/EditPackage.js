import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Upload, Select, message } from "antd";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const { Option } = Select;

const EditPackage = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [packageId, setPackageId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // from the URL (route defined as /Edit-Package/:id?)
  // Try to get the package from location.state if available
  const existingPackageFromState = location.state?.package || null;

  // Fetch products from the API
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

    // If package data was passed via location.state, use it
    if (existingPackageFromState) {
      setPackageId(existingPackageFromState._id);
      form.setFieldsValue({
        name: existingPackageFromState.name,
        discount: existingPackageFromState.discount,
      });

      if (existingPackageFromState.image) {
        setPreview(existingPackageFromState.image);
      }

      

      // Map over products and ensure they contain name, unit, and sellingPrice
      const updatedProducts = existingPackageFromState.products.map((item) => ({
        productId: item.productId._id, // Ensure we have the productId
        name: item.productId.name, // Populate name
        unit: item.productId.unit, // Populate unit
        sellingPrice: item.productId.sellingPrice, // Populate sellingPrice
        quantity: item.quantity, // Retain quantity
      }));
      setSelectedProducts(updatedProducts);
      setImage(existingPackageFromState.image);
      setDiscount(existingPackageFromState.discount);
      calculatePrices(updatedProducts, existingPackageFromState.discount);
    } else if (id) {
      // Otherwise, fetch the package details using the ID from the URL
      axios
        .get(`http://localhost:5000/api/packages/${id}`)
        .then((response) => {
          const pkg = response.data;
          setPackageId(pkg._id);
          form.setFieldsValue({ name: pkg.name, discount: pkg.discount });

          // Map over products and ensure they contain name, unit, and sellingPrice
          const updatedProducts = pkg.products.map((item) => ({
            productId: item.productId._id,
            name: item.productId.name,
            unit: item.productId.unit,
            sellingPrice: item.productId.sellingPrice,
            quantity: item.quantity,
          }));
          setSelectedProducts(updatedProducts);
          setImage(pkg.image);
          setDiscount(pkg.discount);
          calculatePrices(updatedProducts, pkg.discount);
        })
        .catch((error) => {
          message.error("Failed to load package");
        });
    }
  }, [fetchProducts, existingPackageFromState, form, id]);

  const handleSubmit = async (values) => {
    if (!image) return message.error("Please upload an image");
    if (!packageId) return message.error("Package ID is missing");

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("discount", discount.toString());
    formData.append("image", image);
    formData.append("products", JSON.stringify(selectedProducts));

    try {
      await axios.put(
        `http://localhost:5000/api/packages/${packageId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      message.success("Package updated successfully");
      navigate("/packages"); // Redirect to packages list
    } catch (error) {
      console.error("Error updating package:", error.response?.data || error.message);
      message.error(
        "Error updating package: " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const addProductRow = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", name: "", unit: "", sellingPrice: 0, quantity: 1 },
    ]);
  };

  const handleProductChange = (index, id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      productId: id,
      name: product.name,
      unit: product.unit,
      sellingPrice: product.sellingPrice,
      quantity: 1,
    };

    setSelectedProducts(updatedProducts);
    calculatePrices(updatedProducts, discount);
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

  
  

  const removeProductRow = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    calculatePrices(updatedProducts, discount);
  };

  const calculatePrices = (selected, discount) => {
    let total = selected.reduce(
      (sum, item) => sum + item.sellingPrice * item.quantity,
      0
    );
    let final = discount ? total - total * (discount / 100) : total;
    setTotalPrice(total);
    setFinalPrice(final);
  };

  return (
    <div className="admin-dashboard-container">
    <Adminnaviagtion /> 
    <p><br></br></p>  <p><br></br></p> 
    <div className="main-content">
    <div>
    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
    Edit Package</p>
     
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Package Name"
          rules={[{ required: true, message: "Enter package name" }]}
        >
          <Input />
        </Form.Item>

        <Button type="dashed" onClick={addProductRow} style={{ marginBottom: 20,backgroundColor: "#1E88E5", color: "white" }}>
          + Add Product
        </Button>

        {selectedProducts.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 10 }}>
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
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {`${product.name || ""} - ${product.sku || ""}`}
                </Option>
              ))}
            </Select>

            <span>{item.unit}</span>
            <span>Rs. {item.sellingPrice || 0}</span>
            <span>quantity</span>
            <Input
              type="text"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              placeholder="Enter quantity"
              style={{ width: "100px" }}
            />
            <span>{item.quantity}</span>
            <Button type="link" danger onClick={() => removeProductRow(index)}>
              Remove
            </Button>
          </div>
        ))}

        <Form.Item label="Discount">
          <Input
            value={discount}
            onChange={(e) => {
              const newDiscount = parseFloat(e.target.value) || 0;
              setDiscount(newDiscount);
              calculatePrices(selectedProducts, newDiscount); // Recalculate prices on discount change
            }}
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
      const isImage = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
      if (!isImage) {
        message.error("Only JPG, JPEG, and PNG files are allowed!");
        return Upload.LIST_IGNORE;
      }

      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      return false; // prevent auto-upload
    }}
    showUploadList={false}
  >
    <Button >Upload Image</Button>
  </Upload>

  {preview && (
    <img
      src={preview}
      alt="Preview"
      style={{
        marginTop: "10px",
        maxWidth: "600px",
        borderRadius: "8px",
        marginBottom:"50px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)", // small glow effect
      }}
    />
  )}
</Form.Item>



        <Form.Item>
          <Button style={{ backgroundColor: "#1E88E5", color: "white",width:'100%'}} type="primary" htmlType="submit">
            Update Package
          </Button>
        </Form.Item>
      </Form>
    </div>
    </div>
    </div>
  );
};

export default EditPackage;
