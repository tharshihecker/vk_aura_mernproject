import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserHome.css";
import { useAuth } from "../hooks/useAuth";
import UserComponent from "../Component/Usercomponent";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [priests, setPriests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [packageIndex, setPackageIndex] = useState(0);
  const [priestIndex, setPriestIndex] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchPriests();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setPackageIndex(prev => (prev + 1) % packages.length);
    }, 2000); // 5 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [packages]);
  
  // Automatically change priests every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPriestIndex(prev => (prev + 1) % priests.length);
    }, 2000); // 5 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [priests]);

  

  const fetchPackages = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/packages`);
    setPackages(data);
  };

  const fetchPriests = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/priests`);
    setPriests(data);
  };

  

  const getSlidingWindow = (array, currentIndex) => {
    const totalItems = array.length;
    if (totalItems === 0) return [];
    if (totalItems <= 4) return array;
    return [
      array[currentIndex % totalItems],
      array[(currentIndex + 1) % totalItems],
      array[(currentIndex + 2) % totalItems],
      array[(currentIndex + 3) % totalItems],
    ];
  };

  const displayedPackages = getSlidingWindow(packages, packageIndex);
  const displayedPriests = getSlidingWindow(priests, priestIndex);

  return (
    <div className="dashboard-container">
      <UserComponent
        user={user}
      />

      <main className="dashboard-content">
        <section className="carousel-section">
          <div className="carousel-final-box">
            <div className="side-buttons">
              <button  style={{backgroundColor:"blue"}} className="side-arrow-button" onClick={() => setPackageIndex(prev => (prev - 1 + packages.length) % packages.length)}>&#8249;</button>
              <button  style={{backgroundColor:"blue"}} className="side-arrow-button" onClick={() => setPackageIndex(prev => (prev + 1) % packages.length)}>&#8250;</button>
            </div>

            <div className="package-priest-container" >
              {packages.length > 0 && (
                <div style={{height:"450px",width:"300px"}} className="package-card" onClick={() => navigate("/view-package")}> 
                  <h3 className="card-heading">PACKAGES</h3>
                  <img   style={{width:"250px",height:"210px"}} src={packages[packageIndex]?.image || "#"} alt={packages[packageIndex]?.name || "Package"} className="package-image" />
                  <h4>{packages[packageIndex]?.name || "Package Name"}</h4>
                  <p>Price: Rs. {packages[packageIndex]?.totalPrice || "0"}</p>
                </div>
              )}

              {priests.length > 0 && (
                <div   style={{height:"450px",width:"300px"}} className="priest-card" onClick={() => navigate("/user/book-priest")}> 
                  <h3 className="card-heading">PRIESTS</h3>
                  <img  style={{width:"250px",height:"210px"}} src={priests[priestIndex]?.photo ? `${BASE_URL}${priests[priestIndex].photo}` : "#"} alt={priests[priestIndex]?.name || "Priest"} className="priest-image" />
                  <h4>{priests[priestIndex]?.name || "Priest Name"}</h4>
                  <p>Daily Charge: Rs. {priests[priestIndex]?.dailyCharge || "0"}</p>
                </div>
              )}
            </div>

            <div className="side-buttons">
              <button style={{backgroundColor:"blue"}} className="side-arrow-button" onClick={() => setPriestIndex(prev => (prev - 1 + priests.length) % priests.length)}>&#8249;</button>
              <button style={{backgroundColor:"blue"}} className="side-arrow-button" onClick={() => setPriestIndex(prev => (prev + 1) % priests.length)}>&#8250;</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
