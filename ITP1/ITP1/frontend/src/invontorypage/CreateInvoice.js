import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, message } from 'antd';
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation';

const { Option } = Select;

const CreateInvoice = () => {
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
    setSelectedProducts([
      ...selectedProducts,
      { productId: '', quantity: 1, rate: 0, costPrice: 0, amount: 0 },
    ]);
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
      rate: selectedProduct.sellingPrice,
      costPrice: selectedProduct.costPrice,
      amount: selectedProduct.sellingPrice * updatedProducts[index].quantity,
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
      await axios.post('http://localhost:5000/api/invoices', {
        customerName: values.customerName,
        invoiceDate: values.invoiceDate,
        discount: discount,
        items: selectedProducts,
      });
      message.success('Invoice created successfully');
      form.resetFields();
      setSelectedProducts([]);
      setTotalAmount(0);
      setAmountAfterDiscount(0);
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Error creating invoice');
    }
  };

  const removeProductRow = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts, discount);
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>
      <div className="main-content" style={{width:'600px'}}>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Create Invoice </p>
       
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{width:'600px'}}>
          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[{ required: true, message: 'Customer name is required' }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            label="Invoice Date"
            name="invoiceDate"
            initialValue={todayDate}
            rules={[{ required: true, message: 'Invoice date is required' }]}
          >
            <Input type="date" disabled />
          </Form.Item>

          <Button
            style={{ backgroundColor: "#1E88E5", color: "white"}}
            type="dashed"
            onClick={addProductRow}
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
                  option.children?.toString()?.toLowerCase()?.includes(input.toLowerCase())
                }
              >
                {products.map((product) => (
                  <Option key={product._id} value={product._id}>
                    {`${product.name || ""} - ${product.sku || ""}`}
                  </Option>
                ))}
              </Select>

              <Input
                type="text"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                min={0.01}
                style={{ width: "100px" }}
              />

              <span style={{ marginLeft: '10px' }}>{item.unit || "unit"}</span>
              <span style={{ marginLeft: '10px' }}>Rate: Rs. {item.rate || 0}</span>
              <span style={{ marginLeft: '10px' }}>Amount: Rs. {item.amount.toFixed(2)}</span>
              <Button type="link" danger onClick={() => removeProductRow(index)}>
                Remove
              </Button>
            </div>
          ))}

          <Form.Item label="Discount (%)" name="discount">
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={discount}
              onChange={(e) => handleDiscountChange(Number(e.target.value))}
            />
          </Form.Item>

          <Form.Item>
            <Button
              style={{backgroundColor: "#1E88E5", color: "white",width:'600px' }}
              type="primary"
              htmlType="submit"
            >
              Create Invoice
            </Button>
          </Form.Item>
        </Form>

        <div>
          <h3>Total Amount: Rs. {totalAmount.toFixed(2)}</h3>
          <h3>Amount After Discount: Rs. {amountAfterDiscount.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
