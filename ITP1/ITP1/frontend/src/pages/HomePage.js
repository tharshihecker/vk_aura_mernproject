import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css"; // Ensure this is the correct path
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import vkImage from "../styles/vk.jpg";
import vklogoImage from "../styles/vklogo.png";


const BASE_URL = "http://localhost:5000";

const HomePage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [priests, setPriests] = useState([]);
  const [packageIndex, setPackageIndex] = useState(0);
  const [priestIndex, setPriestIndex] = useState(0);

  useEffect(() => {
    fetchPackages();
    fetchPriests();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/packages`);
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchPriests = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/priests`);
      setPriests(data || []);
    } catch (error) {
      console.error("Error fetching priests:", error);
    }
  };

  useEffect(() => {
    const packageInterval = setInterval(() => {
      if (packages.length) {
        setPackageIndex((prevIndex) => (prevIndex + 1) % packages.length);
      }
    }, 2500);
    return () => clearInterval(packageInterval);
  }, [packages]);

  useEffect(() => {
    const priestInterval = setInterval(() => {
      if (priests.length) {
        setPriestIndex((prevIndex) => (prevIndex + 1) % priests.length);
      }
    }, 2500);
    return () => clearInterval(priestInterval);
  }, [priests]);

  const getSlidingWindow = (array, currentIndex) => {
    const totalItems = array.length;
    if (totalItems === 0) return [];
    if (totalItems <= 3) return array;
    return [
      array[currentIndex % totalItems],
      array[(currentIndex + 1) % totalItems],
      array[(currentIndex + 2) % totalItems],
     
    ];
  };

  const displayedPackages = getSlidingWindow(packages, packageIndex);
  const displayedPriests = getSlidingWindow(priests, priestIndex);

  return (
    <div className="home-page" style={{marginBottom: "0px", marginTop: "0px"}}>


<div className="top-banner" style={{marginBottom: "0px"}}>
<img src={vkImage} alt="Background" className="banner-img large" />
  <img src={vkImage} alt="Background" className="banner-img large" />
  <img src={vkImage} alt="Background" className="banner-img large" />
 </div>


<main className="dashboard-content1" >
 
 <section className="carousel-section12">
          <p className="carousel-heading">Packages</p>
          <div className="carousel-container">
            <button className="arrow-button" onClick={() => setPackageIndex((prevIndex) => (prevIndex - 1 + packages.length) % packages.length)}>
              &#8249;
            </button>
            <div className="package-section">
              {displayedPackages.length > 0 ? (
                displayedPackages.map((pkg, idx) => (
                  <div key={pkg?._id || idx} className="package-card" onClick={() => navigate("/Login")}>
                    <img src={pkg?.image || "#"} alt={pkg?.name || "Package"} className="package-image" />
                    <h3>{pkg?.name || "Package Name"}</h3>
                    <p>Price: Rs. {pkg?.totalPrice || "0"}</p>
                  </div>
                ))
              ) : (
                <p>Loading packages...</p>
              )}
            </div>
            <button className="arrow-button" onClick={() => setPackageIndex((prevIndex) => (prevIndex + 1) % packages.length)}>
              &#8250;
            </button>
          </div>
        </section>

        <section className="carousel-section">
          <p className="carousel-heading">Priests</p>
          <div className="carousel-container">
            <button className="arrow-button" onClick={() => setPriestIndex((prevIndex) => (prevIndex - 1 + priests.length) % priests.length)}>
              &#8249;
            </button>
            <div className="priest-section">
              {displayedPriests.length > 0 ? (
                displayedPriests.map((priest, idx) => (
                  <div key={priest?._id || idx} className="priest-card" onClick={() => navigate("/Login")}>
                    <img src={priest?.photo ? `${BASE_URL}${priest.photo}` : "#"} alt={priest?.name || "Priest"} className="priest-image" />
                    <h3>{priest?.name || "Priest Name"}</h3>
                    <p>Daily Charge: Rs. {priest?.dailyCharge || "0"}</p>
                  </div>
                ))
              ) : (
                <p>Loading priests...</p>
              )}
            </div>
            <button className="arrow-button" onClick={() => setPriestIndex((prevIndex) => (prevIndex + 1) % priests.length)}>
              &#8250;
            </button>
          </div>
        </section>
      </main>
    
      <footer className="footer" style={{marginTop: "40px"}}>
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
