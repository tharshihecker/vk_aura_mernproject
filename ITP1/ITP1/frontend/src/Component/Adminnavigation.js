import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaArrowLeft, FaSignOutAlt, FaBars } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Adminnaviagation.css';
import '../styles/AdminDashboard.css';

const Adminnaviagtion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [openSections, setOpenSections] = useState({
    'Home': false,
    'User Management': false,
    'Inventory Management': false,
    'Order Management': false,
    'Booking Management': false,
    'Feedback Management': false,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const defaultProfilePicUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.isAdmin) {
          setError('Access denied. Admins only.');
          navigate('/user-home');
          return;
        }
      } catch (err) {
        console.error('Error verifying admin access:', err);
        setError('Failed to verify admin access');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  const handleToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const sidebarItems = [
    {
      title: 'Home',
      links: [{ to: '/admin-dashboard', label: 'Admin Dashboard' }, { to: '/SalesReport', label: 'Sales Report' }]
    },
    {
      title: 'User Management',
      links: [
        { to: '/admin/manage-users', label: 'Manage Users' },
        { to: '/admin/deleted-users', label: 'Removed Users' },
        { to: '/admin/user-prayers', label: ' User Prayers' },

        { to: '/admin/view-summary', label: 'User Summary' },
      ],
    },
    {
      title: 'Inventory',
      links: [
        { to: '/add-product', label: 'Add New Product' },
        { to: '/product-list', label: 'View All Products' },
        { to: '/add-package', label: 'Add Package' },
        { to: '/packages', label: 'View All Packages' },
        { to: '/create-invoice', label: 'Create Invoice' },
        { to: '/invoices', label: 'View All Invoices' },
        { to: '/purchases/create', label: 'Create the bill' },
        { to: '/purchases', label: 'View all bill' },
      ],
    },
    {
      title: 'Orders',
      links: [
        { to: '/admin/view-bookings', label: 'Order Bookings' },
        { to: '/admin/viewPayment', label: 'Order Payments' },
        { to: '/admin/Add-Offer', label: 'Add Offers' },
        { to: '/admin/order-report', label: 'Order Summary' },
        { to: '/admin/ProductReport', label: 'Order Report' },
      ],
    },
    {
      title: 'Bookings',
      links: [
        { to: '/admin/add-priest', label: 'Add Priest' },
        { to: '/admin/priest-list', label: 'View All Priests' },
        { to: '/admin/booking-list', label: 'View Bookings' },
      ],
    },
    {
      title: 'Feedback',
      links: [{ to: '/adminFeedback', label: 'View Feedback' }, { to: '/AdminChatPage', label: 'View chats' }],
    },
  ];

  const BackButton = () => {
    const handleBack = () => {
      if (location.pathname === '/admin-dashboard') return;
      navigate(-1);
    };

    return (
      <button className="back-btn" onClick={handleBack}>
        <FaArrowLeft /> Back
      </button>
    );
  };

  if (loading) return <p>Loading Admin Dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <header className="navbar" style={{ background: '#2c3e50',paddingTop:"10px"}}>
        <div className="navbar-right" >
          <button className="hamburger-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
          <BackButton />
          <div className="admin-profile-section">
            <p className="admin-welcome-text" style={{fontSize:"32px" ,marginLeft:"300px",marginRight:"350px"}}>Welcome Admin, <strong>{user?.name || 'Admin'}</strong></p>
            <div className="admin-profile-wrapper" onClick={() => navigate('/admin/view-profile')}>
              <img
                src={user?.profilePic ? user.profilePic : defaultProfilePicUrl}
                alt="Admin Profile"
                className="admin-profile-photo"
              />
            </div>
          </div>
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ background: '#2c3e50', paddingTop: '20px' }}>
        <ul className="sidebar-menu" style={{marginTop:"100px", marginBottom:"100px"}}>
          {sidebarItems.map((item, index) => (
            <li key={index} style={{background: 'rgb(255, 255, 255)'}}>
              <button className="sidebar-toggle" onClick={() => handleToggle(item.title)} style={{ color: 'black' }}>
                {item.title}
              </button>
              {openSections[item.title] && (
                <ul className="nested-menu">
                  {item.links.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="admin-logout-modal-overlay" onClick={cancelLogout}>
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
              <button className="admin-logout-no-btn" onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adminnaviagtion;
