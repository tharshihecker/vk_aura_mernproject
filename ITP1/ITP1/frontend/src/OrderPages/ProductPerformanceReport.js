import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ProductPerformanceReport.css";
import Adminnaviagtion from "../Component/Adminnavigation";
import { FaDownload } from "react-icons/fa";

// Download Button Component
const ReportDownloadButton = ({ format = "excel", startDate, endDate }) => {
  const downloadReport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start", new Date(startDate).toISOString());
      if (endDate) params.append("end", new Date(endDate).toISOString());
      params.append("format", format);

      const res = await axios.get(`http://localhost:5000/api/reports/product-performance?${params.toString()}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `product_report.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report:", err);
    }
  };

  return (
    <button
      onClick={downloadReport}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
    >
      
      Download {format.toUpperCase()} Report  <FaDownload />
    </button>
  );
};

const ProductPerformanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.start = filters.startDate.toISOString();
      if (filters.endDate) params.end = filters.endDate.toISOString();

      const res = await axios.get("http://localhost:5000/api/reports/product-performance", { params });
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(); // Initial full fetch
  }, []);

  const handleFilter = () => {
    fetchReport({ startDate, endDate }); // fetch with filters
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    fetchReport(); // fetch all data
  };

  const hasFilters = startDate || endDate;

  return (
    <div>
      <Adminnaviagtion />
      <div className="p-6">
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        📊 Product Performance Report </p>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            className="border p-2 rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            className="border p-2 rounded"
          />
          <button
            onClick={handleFilter}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Filter
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Download Buttons */}
        <div className="mt-6 flex gap-4">
              <ReportDownloadButton format="excel" startDate={startDate} endDate={endDate} />
              <ReportDownloadButton format="pdf" startDate={startDate} endDate={endDate} />
            </div>

        {/* Table */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Product</th>
                  <th className="border px-4 py-2 text-right">Units Sold</th>
                  <th className="border px-4 py-2 text-right">Revenue</th>
                  <th className="border px-4 py-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{row._id}</td>
                    <td className="border px-4 py-2 text-right">{row.unitsSold}</td>
                    <td className="border px-4 py-2 text-right">Rs. {row.totalRevenue.toFixed(2)}</td>
                    <td className="border px-4 py-2 text-right">Rs. {row.totalProfit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPerformanceReport;
