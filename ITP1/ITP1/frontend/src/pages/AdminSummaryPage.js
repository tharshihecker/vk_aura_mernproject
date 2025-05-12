import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Adminnaviagtion from "../Component/Adminnavigation";
import '../styles/AdminSummary.css';

const AdminSummary = () => {
  const navigate = useNavigate();
  const reportRef = useRef();

  const [userSummary, setUserSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [monthlyChartData, setMonthlyChartData] = useState(null);
  const [cumulativeChartData, setCumulativeChartData] = useState(null);
  const [deviationChartData, setDeviationChartData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [summaryCards, setSummaryCards] = useState({});
  const [top5Days, setTop5Days] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dailyChartData, setDailyChartData] = useState(null);
  const [dailyDeviationChartData, setDailyDeviationChartData] = useState(null);

  const generateMonthlyData = (data, monthDate) => {
    if (!monthDate) return [];

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const fullDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const iso = date.toISOString().split('T')[0];
      fullDates.push(iso);
    }

    const dateMap = new Map(data.map(item => [item._id, item.totalUsers]));

    return fullDates.map(date => ({
      _id: date,
      totalUsers: dateMap.get(date) || 0
    }));
  };

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.isAdmin) navigate('/user-home');
        else fetchUserSummary(token);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    const fetchUserSummary = async (token) => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/user-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || [];
        setUserSummary(data);
        setFilteredSummary(data);
        setSelectedMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); 

        const dates = data.map(item => item._id);
        const totalUsers = data.map(item => item.totalUsers);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(1, 'red');

        setChartData({
          labels: dates,
          datasets: [{
            label: 'Users Joined',
            data: totalUsers,
            borderColor: gradient,
            backgroundColor: 'rgba(75,192,192,0.2)',
            fill: true,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        });

        const mean = totalUsers.reduce((sum, n) => sum + n, 0) / totalUsers.length;
        const stdDev = Math.sqrt(totalUsers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / totalUsers.length);
        const expected = totalUsers.map(() => mean);
        const upper = totalUsers.map(() => mean + stdDev);
        const lower = totalUsers.map(() => mean - stdDev);

        setDeviationChartData({
          labels: dates,
          datasets: [
            {
              label: 'Actual Users Joined',
              data: totalUsers,
              borderColor: 'blue',
              backgroundColor: 'rgba(0,0,255,0.1)',
              fill: true
            },
            {
              label: 'Mean',
              data: expected,
              borderColor: 'green',
              borderDash: [5, 5],
              fill: false
            },
            {
              label: '+1 Std Dev',
              data: upper,
              borderColor: 'orange',
              borderDash: [5, 5],
              fill: false
            },
            {
              label: '-1 Std Dev',
              data: lower,
              borderColor: 'red',
              borderDash: [5, 5],
              fill: false
            }
          ]
        });

        const monthlyMap = {};
        const cumulative = [];
        let running = 0;
        data.forEach(item => {
          const date = new Date(item._id);
          if (!isNaN(date)) {
            const month = date.toLocaleString('default', { month: 'long' });
            monthlyMap[month] = (monthlyMap[month] || 0) + item.totalUsers;
          }
          running += item.totalUsers;
          cumulative.push({ _id: item._id, cumulativeUsers: running });
        });

        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const monthCounts = months.map(month => monthlyMap[month] || 0);

        setMonthlyChartData({
          labels: months,
          datasets: [{
            label: 'Users Joined Per Month',
            data: monthCounts,
            borderColor: '#ff7f50',
            backgroundColor: 'rgba(255,127,80,0.2)',
            fill: true,
            tension: 0.2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        });

        setCumulativeChartData({
          labels: cumulative.map(i => i._id),
          datasets: [{
            label: 'Cumulative Users Joined',
            data: cumulative.map(i => i.cumulativeUsers),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40,167,69,0.2)',
            fill: true,
            tension: 0.2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        });

        const total = data.reduce((sum, item) => sum + item.totalUsers, 0);
        const active = data.filter(item => item.totalUsers > 0).length;
        const peak = data.reduce((a, b) => a.totalUsers > b.totalUsers ? a : b);
        const minCount = Math.min(...data.map(d => d.totalUsers));
        const lowestDays = data.filter(d => d.totalUsers === minCount);

        setSummaryCards({
          'Total Users Joined': total,
          'Active Days': active,
          'Peak Join Date': `${peak._id} (${peak.totalUsers} users)`
        });

        const sorted = data.filter(d => d.totalUsers > 1).sort((a, b) => b.totalUsers - a.totalUsers).slice(0, 5);
        setTop5Days(sorted);
      } catch (err) {
        alert("❌ Failed to fetch user summary");
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  useEffect(() => {
    const isInDateRange = (dateStr) => {
      const date = new Date(dateStr);
      return (!startDate || date >= new Date(startDate.setHours(0, 0, 0, 0))) &&
             (!endDate || date <= new Date(endDate.setHours(23, 59, 59, 999)));
    };

    const isInMonthRange = (dateStr) => {
      if (!startMonth) return true;
      const date = new Date(dateStr);
      return date.getFullYear() === startMonth.getFullYear() && date.getMonth() === startMonth.getMonth();
    };

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = userSummary.filter(item => {
      const dateMatch = item._id.toLowerCase().includes(lowerSearch);
      const userMatch = Array.isArray(item.users) && item.users.some(user =>
        user.name.toLowerCase().includes(lowerSearch) || user.email.toLowerCase().includes(lowerSearch)
      );
      const monthMatch = new Date(item._id).toLocaleString('default', { month: 'long' }).toLowerCase().includes(lowerSearch);
      return (dateMatch || userMatch || monthMatch) && isInDateRange(item._id) && isInMonthRange(item._id);
    });

    setFilteredSummary(filtered);
  }, [searchTerm, userSummary, startDate, endDate, startMonth]);

  useEffect(() => {
    if (!selectedMonth || userSummary.length === 0) return;

    const filledMonthData = generateMonthlyData(userSummary, selectedMonth);
    const dates = filledMonthData.map(item => item._id);
    const totalUsers = filledMonthData.map(item => item.totalUsers);

    const mean = totalUsers.reduce((sum, val) => sum + val, 0) / totalUsers.length;
    const stdDev = Math.sqrt(totalUsers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totalUsers.length);
    const expected = totalUsers.map(() => mean);
    const upper = totalUsers.map(() => mean + stdDev);
    const lower = totalUsers.map(() => Math.max(0, mean - stdDev));

    setDailyChartData({
      labels: dates,
      datasets: [{
        label: 'Users Joined',
        data: totalUsers,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.1,
        pointRadius: 4,
      }]
    });

    setDailyDeviationChartData({
      labels: dates,
      datasets: [
        {
          label: 'Actual',
          data: totalUsers,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true
        },
        {
          label: 'Mean',
          data: expected,
          borderColor: 'green',
          borderDash: [4, 4],
          fill: false
        },
        {
          label: '+1 Std Dev',
          data: upper,
          borderColor: 'orange',
          borderDash: [4, 4],
          fill: false
        },
        {
          label: '-1 Std Dev',
          data: lower,
          borderColor: 'red',
          borderDash: [4, 4],
          fill: false
        }
      ]
    });

  }, [selectedMonth, userSummary]);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const originalHeight = element.scrollHeight;
  
    html2canvas(element, {
      scrollY: -window.scrollY, // Fix vertical offset
      height: originalHeight, // Ensure full content height
      useCORS: true, // If using external images
      windowWidth: element.scrollWidth
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      // If content is taller than one page, split across multiple pages
      let position = 0;
      if (pdfHeight > 297) {
        const pageHeight = 297;
        while (position < pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
          position += pageHeight;
          if (position < pdfHeight) pdf.addPage();
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
  
      pdf.save('admin-summary-report.pdf');
    });
  };
  
  

  const handlePrint = () => window.print();

  return (
    <div className="admin-summary-container" ref={reportRef}>
      <Adminnaviagtion />
      <p className="admin-summary-title">User Summary</p>
      <div className="admin-summary-controls">
  <button onClick={handlePrint} className="print-btn">🖨️ Print</button>
  <button onClick={handleDownloadPDF} className="download-btn">⬇️ Download</button>
</div>

      
      <div className="admin-summary-cards">
  {Object.entries(summaryCards).map(([title, value], idx) => (
    <div key={idx} className="summary-card">
      <h4>{title}</h4>
      <div className="summary-value">{value}</div>
      </div>
  ))}
</div>

      {/* Month Picker for Daily Chart */}
      <div className="centered-month-picker">
  <label htmlFor="monthly-picker">Select Month for Daily Summary:</label>
  <DatePicker
    id="monthly-picker"
    selected={selectedMonth}
    onChange={(date) => setSelectedMonth(date)}
    dateFormat="MM/yyyy"
    showMonthYearPicker
    isClearable
    placeholderText="Choose Month"
    className="custom-month-input"
  />
</div>

      {/* 📅 Daily User Join Summary */}
      <h3 className="admin-summary-heading">📅 Daily User Join Summary</h3>
      {selectedMonth && dailyChartData ? (
        <div className="admin-summary-chart-container">
          <Line
            data={dailyChartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: value => Number.isInteger(value) ? value : null
                  }
                }
              }
            }}
          />
        </div>
      ) : (
        <p>📆 Please select a month to view daily summary.</p>
      )}

      {/* 📊 Deviation Chart */}
      <h3 className="admin-summary-heading">📊 Expected vs Actual Join Deviation</h3>
      {selectedMonth && dailyDeviationChartData ? (
        <div className="admin-summary-chart-container">
          <Line
            data={dailyDeviationChartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: value => Number.isInteger(value) ? value : null
                  }
                }
              }
            }}
          />
        </div>
      ) : (
        <p>📊 Select a month to analyze deviation from average.</p>
      )}
  <h3 className="admin-summary-heading">📅 Monthly User Join Summary</h3>
      <div className="admin-summary-chart-container">{monthlyChartData && <Line data={monthlyChartData} />}</div>

      <h3 className="admin-summary-heading">📈 Cumulative User Growth</h3>
      <div className="admin-summary-chart-container">{cumulativeChartData && <Line data={cumulativeChartData} />}</div>
 
          {/* Top 5 Days */}
      <h3 className="admin-summary-heading">🏆 Top 5 Join Days</h3>
      <table className="top-join-days-table">
        <thead><tr><th>Date</th><th>Users Joined</th></tr></thead>
        <tbody>
          {top5Days.map((item, idx) => (
            <tr key={idx}><td>{item._id}</td><td>{item.totalUsers}</td></tr>
          ))}
        </tbody>
      </table>
      {/* Search + Filter */}
      <div className="admin-summary-search-box">
        <input
          type="text"
          placeholder="Search by date, name, email, or month"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-summary-search-input"
        />
        <div className="date-picker-row">
          <div><label>📅 Start Date: </label>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} disabled={!!startMonth} maxDate={endDate} isClearable placeholderText="Start Date" />
          </div>
          <div><label>📅 End Date: </label>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} disabled={!!startMonth} minDate={startDate} isClearable placeholderText="End Date" />
          </div>
          <div><label>📆 Month: </label>
            <DatePicker selected={startMonth} onChange={(date) => { setStartMonth(date); setStartDate(null); setEndDate(null); }} dateFormat="MM/yyyy" showMonthYearPicker isClearable placeholderText="Select Month" />
          </div>
          <button className="clear-filter-btn" onClick={() => { setSearchTerm(''); setStartDate(null); setEndDate(null); setStartMonth(null); }}>🔄 Clear Filters</button>
        </div>
        {(searchTerm || startDate || endDate || startMonth) && (
          <p className="search-count">🔍 {filteredSummary.length} result{filteredSummary.length !== 1 ? 's' : ''} found</p>
        )}
      </div>
      {/* Table */}
      <div className="admin-summary-user-details" >
        <h3 className="admin-summary-heading">Users Joined</h3>
        <div className="admin-summary-table-wrapper" style={{marginLeft:"100px" }}>
          {filteredSummary.length > 0 ? (
            <table className="admin-summary-user-table">
              <thead>
                <tr><th>Date</th><th>Total Users Joined</th><th>User Details</th></tr>
              </thead>
              <tbody>
                {filteredSummary.map((item, index) => (
                  <tr key={index}>
                    <td>{item._id}</td>
                    <td>{item.totalUsers}</td>
                    <td>
                      <ul>
                        {Array.isArray(item.users) && item.users.map((user, i) => (
                          <li key={i}>Name: {user.name}, Email: {user.email}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>No users data available.</p>)}
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
