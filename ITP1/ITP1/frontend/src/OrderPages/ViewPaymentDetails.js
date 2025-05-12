import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin, message } from "antd";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const ViewPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payment/viewPaymentDetails");
        setPayments(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load payment data.");
        setLoading(false);
        message.error("Failed to load payment data.");
      }
    };

    fetchPayments();
  }, []);

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Phone",
      dataIndex: "userPhone",
      key: "userPhone",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `Rs.${totalPrice.toFixed(2)}`,
    },
    {
      title: "Payment Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>   <p><br></br></p>
      <div className="main-content" style={{width:'100%'}}>
        <div className="admin-payments-container">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        💵 Payment Details</p>
         
          {loading ? (
            <Spin size="large" />
          ) : (
            <Table
              dataSource={payments}
              columns={columns}
              rowKey="_id"
              bordered
              pagination={false}
            />
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ViewPayments;
