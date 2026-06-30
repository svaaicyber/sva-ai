import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Download, Trash2, HardDrive, Loader2 } from 'lucide-react';
import '../styles/memory-library.css';

// 🚨 TERA LIVE RENDER CLOUD BACKEND
const API_URL = "https://sva-eniy.onrender.com/api/library";

export default function Library() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ 🚨 FETCH LIVE IMAGES FROM BACKEND
  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sva_token");
      if (!token) throw new Error("No token found");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Sort newest first
        setImages(data.assets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // 2️⃣ 🚨 DELETE IMAGE FROM BACKEND
  const deleteImage = async (id) => {
    try {
      const token = localStorage.getItem("sva_token");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setImages(images.filter(img => img._id !== id));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="sva-dashboard-wrapper">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="title-section">
          <ImageIcon size={32} color="#06b6d4" />
          <div>
            <h1>Asset Library</h1>
            <p>Your generated files securely stored on the cloud.</p>
          </div>
        </div>
        <div className="server-status" style={{ color: loading ? '#eab308' : '#06b6d4' }}>
          {loading ? <Loader2 size={14} className="spin-loader"/> : <HardDrive size={14} />} 
          {loading ? "Syncing..." : `${images.length} Assets Found`}
        </div>
      </motion.div>

      {loading ? (
        <div className="empty-state" style={{marginTop: '100px'}}>
          <Loader2 size={40} className="spin-loader" color="#06b6d4"/>
        </div>
      ) : images.length > 0 ? (
        <div className="library-grid">
          {images.map((img) => (
            <motion.div key={img._id} className="library-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="img-wrapper">
                <img src={img.url} alt={img.prompt} loading="lazy" />
                <div className="img-overlay">
                  <a href={img.url} target="_blank" rel="noreferrer" className="icon-btn download" title="Download">
                    <Download size={18} />
                  </a>
                  <button className="icon-btn delete" onClick={() => deleteImage(img._id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="img-info">
                <p className="prompt" title={img.prompt}>"{img.prompt}"</p>
                <span className="date">{new Date(img.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{marginTop: '100px'}}>
          <ImageIcon size={48} color="#3f3f46" />
          <p>Your library is empty. Generate some images with SVA Vision!</p>
        </div>
      )}
    </div>
  );
}