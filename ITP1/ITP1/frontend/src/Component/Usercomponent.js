import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Dropdown } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import {
  FaComments,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import "./Usercomponent.css";

const BASE_URL = "http://localhost:5000";



const UserComponent = ({ user }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/offers`);
      setOffers(data || []);
      if (user && user._id) {
        const unread = data.filter((offer) => !offer.isReadBy.includes(user._id));
        setUnreadCount(unread.length);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchOffers();
    }
  }, [user]);

  const markAllAsRead = async () => {
    await axios.put(`${BASE_URL}/api/offers/mark-all-read/${user._id}`);
    fetchOffers();
  };

  const handleClickOffer = (pkgId) => {
    localStorage.setItem("highlightPackageId", pkgId);
    navigate("/view-package");
  };

  const offerMenuItems = offers.length > 0 ? [
    ...offers.map((offer) => ({
      key: offer._id,
      label: (
        <div
          key={offer._id}
          className={`offer-item ${offer.isReadBy.includes(user._id) ? "read" : "unread"}`}
          onClick={() => handleClickOffer(offer.packageId._id)}
        >
          <strong>{offer.packageId.name}</strong>
          <p>{offer.offerMessage}</p>
        </div>
      ),
    })),
    { type: "divider" },
    {
      key: "mark-all-read",
      label: (
        <div className="mark-read-bar" onClick={markAllAsRead}>
          <CheckOutlined /> Mark all as read
        </div>
      ),
    },
  ] : [
    {
      key: "no-offers",
      label: <p className="no-offers">No offers available</p>,
      disabled: true,
    },
  ];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/view-profile");
  };

  const handleChatClick = () => {
    navigate("/ChatPage");
  };

  const defaultProfilePicUrl =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
    <>
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </button>
        <Link to="/user-home" onClick={() => setSidebarOpen(false)}>Home</Link>
        <Link to="/view-package" onClick={() => setSidebarOpen(false)}>Packages</Link>
        <Link to="/user/book-priest" onClick={() => setSidebarOpen(false)}>Book Priest</Link>
        <Link to="/OrderHistoryDetails" onClick={() => setSidebarOpen(false)}>Order History</Link> 
        <Link to="/user/booking-list" onClick={() => setSidebarOpen(false)}>Booking Details</Link>
        <Link to="/Feedback" onClick={() => setSidebarOpen(false)}>Feedbacks</Link>
      
      </div>

      <header className="dashboard-header">
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
          </div>
          <div className="nav-center">
            <p className="dashboard-title">
              WELCOME TO VK AURA, {user?.name?.toUpperCase() || "USER"}
            </p>
          </div>
          <div className="nav-right">
            <FaComments className="chat-icon" onClick={handleChatClick} />
            <div className="notification">
              <Dropdown menu={{ items: offerMenuItems }} trigger={["click"]} overlayClassName="dropdownbell">
                <Badge count={unreadCount} offset={[2, -4]}>
                  <BellOutlined style={{ fontSize: 24, cursor: "pointer", color: "#374495" }} />
                </Badge>
              </Dropdown>
            </div>
            <div className="profile-wrapper" onClick={handleProfileClick}>
              <img
                src={user?.profilePic || defaultProfilePicUrl}
                alt="Profile"
                className="profile-photo"
              />
            </div>
            <button className="nav-btn logout-btn" onClick={() => setShowLogoutModal(true)}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </nav>
      </header>

      {showLogoutModal && (
        <div className="admin-logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="admin-logout-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-logout-emoji-animation">
              <img
                src="https://media1.tenor.com/m/G5NOmLUKGPIAAAAC/bola-amarilla.gif"
                alt="Sad Emoji"
                className="admin-logout-animated-emoji"
              />
            </div>
            <p>Are you sure you want to logout?</p>
            <div className="admin-logout-modal-buttons">
              <button className="admin-logout-yes-btn" onClick={confirmLogout}>Yes</button>
              <button className="admin-logout-no-btn" onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserComponent;
