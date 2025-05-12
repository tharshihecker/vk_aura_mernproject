import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Input, Button, Select, message, Popconfirm } from "antd";
import "./AdminOffers.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const { Option } = Select;

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({ packageId: undefined, offerMessage: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchPackages();
    fetchOffers();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/packages");
      setPackages(data);
    } catch (error) {
      message.error("Failed to fetch packages");
    }
  };

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/offers");
      setOffers(data);
    } catch (error) {
      message.error("Failed to fetch offers");
    }
  };

  const handleAddOffer = async () => {
    if (!form.packageId || !form.offerMessage) {
      return message.warning("Please fill all fields");
    }
    try {
      await axios.post("http://localhost:5000/api/offers", form);
      setForm({ packageId: undefined, offerMessage: "" });
      fetchOffers();
      message.success("Offer added");
    } catch (error) {
      message.error("Failed to add offer");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/offers/${id}`);
      setOffers(offers.filter((offer) => offer._id !== id));
      message.success("Offer deleted");
    } catch (error) {
      message.error("Failed to delete offer");
    }
  };

  const handleEdit = (id, currentMessage) => {
    setEditingId(id);
    setEditingMessage(currentMessage);
  };

  const handleSaveEdit = async (id) => {
    if (!editingMessage.trim()) {
      return message.warning("Offer message cannot be empty");
    }
    try {
      const { data } = await axios.put(`http://localhost:5000/api/offers/${id}`, {
        offerMessage: editingMessage,
      });
      setOffers(
        offers.map((offer) =>
          offer._id === id ? { ...offer, offerMessage: data.offerMessage } : offer
        )
      );
      setEditingId(null);
      setEditingMessage("");
      message.success("Offer updated");
    } catch (error) {
      message.error("Failed to update offer");
    }
  };

  const monthMap = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };

  const filteredOffers = offers.filter((offer) => {
    const lowerSearch = searchText.toLowerCase();
    const pkgName = offer.packageId?.name?.toLowerCase() || "";
    const msg = offer.offerMessage?.toLowerCase() || "";
    const price = offer.packageId?.finalPrice?.toString() || "";
    const date = offer.createdAt ? new Date(offer.createdAt) : null;
    const monthNum = date ? String(date.getMonth() + 1).padStart(2, '0') : "";
    const monthName = date ? date.toLocaleString('default', { month: 'short' }).toLowerCase() : "";

    return (
      pkgName.includes(lowerSearch) ||
      msg.includes(lowerSearch) ||
      price.includes(lowerSearch) ||
      monthNum.includes(lowerSearch) ||
      monthName.includes(lowerSearch) ||
      (monthMap[lowerSearch] && monthMap[lowerSearch] === monthNum)
    );
  });

  const columns = [
    {
      title: "Package Name",
      key: "packageName",
      render: (record) => record.packageId?.name || "N/A",
    },
    {
      title: "Offer Message",
      dataIndex: "offerMessage",
      key: "offerMessage",
      render: (text, record) => {
        if (record._id === editingId) {
          return (
            <Input
              value={editingMessage}
              onChange={(e) => setEditingMessage(e.target.value)}
              onPressEnter={() => handleSaveEdit(record._id)}
              style={{ width: "100%" }}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Price (Rs.)",
      key: "finalPrice",
      render: (record) => record.packageId?.finalPrice || "-",
    },
    {
      title: "Date Added",
      key: "createdAt",
      render: (record) => new Date(record.createdAt).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return record._id === editingId ? (
          <span>
            <Button type="primary" size="small" onClick={() => handleSaveEdit(record._id)}>
              Save
            </Button>
            <Button
              size="small"
              style={{ marginLeft: 8 }}
              onClick={() => {
                setEditingId(null);
                setEditingMessage("");
              }}
            >
              Cancel
            </Button>
          </span>
        ) : (
          <span>
            <Button
              type="default"
              size="small"
              className="edit-btn"
              onClick={() => handleEdit(record._id, record.offerMessage)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete this offer?"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button danger size="small" className="delete-btn" style={{ marginLeft: 8, }}>
                Delete
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <div className="admin-dashboard-container">
          <Adminnaviagtion />
    <div className="admin-offers-container">
    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
    ADMIN - MANAGE OFFERS </p>
      

      <div className="admin-offer-form">
        <Select
          placeholder="Select Package"
          value={form.packageId}
          onChange={(value) => setForm({ ...form, packageId: value })}
          style={{ width: 250 }}
        >
          {packages.map((pkg) => (
            <Option key={pkg._id} value={pkg._id}>
              {pkg.name}
            </Option>
          ))}
        </Select>

        <Input
          placeholder="Offer Message"
          value={form.offerMessage}
          onChange={(e) => setForm({ ...form, offerMessage: e.target.value })}
          style={{ width: 400 }}
        />

        <Button type="primary" onClick={handleAddOffer} className="add-offer-btn">
          Add Offer
        </Button>
      </div>

      <Input
        placeholder="Search by package name, message, price or month"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="admin-offer-search"
      />

      <Table
        dataSource={filteredOffers}
        columns={columns}
        rowKey="_id"
        bordered
        pagination={false}
      />
    </div>
    </div>
  );
};

export default AdminOffers;
