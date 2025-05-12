import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, message } from 'antd';
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation';

const { Option } = Select;

const CreatePurchase = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [amountAfterDiscount, setAmountAfterDiscount] = useState(0);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        message.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const addProductRow = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find((product) => product._id === productId);
    if (!selectedProduct) return;

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId,
      productName: selectedProduct.name,
      unit: selectedProduct.unit,
      rate: selectedProduct.costPrice,
      amount: selectedProduct.costPrice * updatedProducts[index].quantity,
    };

    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts, discount);
  };

  const handleQuantityChange = (index, quantity) => {
    setSelectedProducts((prev) => {
      const updatedProducts = [...prev];
      const unit = updatedProducts[index].unit;

      if (quantity === "") {
        updatedProducts[index].quantity = "";
      } else if (unit === "kg" && /^[0-9]*\.?[0-9]{0,2}$/.test(quantity) && parseFloat(quantity) <= 1000) {
        updatedProducts[index].quantity = quantity;
      } else if (unit === "pcs" && /^\d+$/.test(quantity) && parseFloat(quantity) <= 1000) {
        updatedProducts[index].quantity = quantity;
      } else {
        return prev;
      }

      updatedProducts[index].amount = updatedProducts[index].rate * parseFloat(updatedProducts[index].quantity || 0);
      calculateTotal(updatedProducts, discount);
      return updatedProducts;
    });
  };

  const handleDiscountChange = (value) => {
    value = Math.max(0, Math.min(100, value));
    setDiscount(value);
    calculateTotal(selectedProducts, value);
  };

  const calculateTotal = (updatedProducts, discountValue) => {
    let total = updatedProducts.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (total * discountValue) / 100;
    const finalAmount = total - discountAmount;

    setTotalAmount(total);
    setAmountAfterDiscount(finalAmount);
  };

  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/purchases', {
        supplierName: values.supplierName,
        purchaseDate: values.purchaseDate,
        discount: values.discount || 0,
        items: selectedProducts,
      });
      message.success('Purchase recorded successfully');
      form.resetFields();
      setSelectedProducts([]);
      setTotalAmount(0);
      setAmountAfterDiscount(0);
    } catch (error) {
      message.error('Error recording purchase');
    }
  };

  const removeProductRow = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts, discount); // Recalculate total after removal
  };


  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p> 
      <div className="main-content" style={{width:'600px'}}>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
       Create Purchase </p>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{width:'600px'}}>
          <Form.Item label="Supplier Name" name="supplierName" rules={[{ required: true, message: 'Supplier name is required' }]} >
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          <Form.Item label="Purchase Date" name="purchaseDate" initialValue={todayDate}>
            <Input type="date" disabled />
          </Form.Item>

          
          <Button style={{ backgroundColor: "#1E88E5", color: "white" }} type="dashed" onClick={addProductRow}>
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
                        filterOption={(input, option) => option.children?.toString()?.toLowerCase()?.includes(input.toLowerCase())}
                      >
                        {products.map((product) => (
                          <Option key={product._id} value={product._id}>
                            {`${product.name || ""} - ${product.sku || ""}`}
                          </Option>
                        ))}
                      </Select>
          
                      <Input
                        type="text" // Use text type to avoid increment/decrement buttons
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min={0.01}
                        style={{ width: "100px" }}
                      />
          
                      <span style={{ marginLeft: '10px' }}>{item.unit || "unit"}</span> {/* Display unit */}
          
                      <span style={{ marginLeft: '10px' }}>Rate: Rs. {item.rate || 0}</span>
          
                      <span style={{ marginLeft: '10px' }}>Amount: Rs. {item.amount.toFixed(2) || 0}</span> {/* Format amount */}
          
                      <Button type="link" danger onClick={() => removeProductRow(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}

          <Form.Item label="Discount (%)" name="discount">
            <Input type="number" min="0" max="100" value={discount} onChange={(e) => handleDiscountChange(Number(e.target.value))} />
          </Form.Item>

          <Button   style={{ backgroundColor: "#1E88E5", color: "white" }} type="primary" htmlType="submit">
            Create Purchase
          </Button>
        </Form>

        <h3>Total Amount: Rs. {totalAmount.toFixed(2)}</h3>
        <h3>Amount After Discount: Rs. {amountAfterDiscount.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default CreatePurchase;
