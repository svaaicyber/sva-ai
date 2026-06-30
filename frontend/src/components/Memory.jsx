import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trash2, Plus, Server, ShieldAlert, Cpu, Loader2 } from 'lucide-react';
import '../styles/memory-library.css';

// 🚨 TERA LIVE RENDER CLOUD BACKEND
const API_URL = "https://sva-eniy.onrender.com/api/memory";

export default function Memory() {
  const [newMemory, setNewMemory] = useState("");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  // Optional: Frontend pe naam dikhane ke liye
  const userName = JSON.parse(localStorage.getItem("sva_user"))?.name || "User";

  // 1️⃣ 🚨 FETCH MEMORIES FROM RENDER BACKEND
  const fetchMemories = async () => {
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
        setMemories(data.memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // 2️⃣ 🚨 ADD DATA TO RENDER BACKEND
  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    const token = localStorage.getItem("sva_token");
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: newMemory })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewMemory("");
        fetchMemories(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding memory:", error);
    }
  };

  // 3️⃣ 🚨 DELETE DATA FROM RENDER BACKEND
  const handleDelete = async (id) => {
    const token = localStorage.getItem("sva_token");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMemories(memories.filter(mem => mem._id !== id));
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  // 4️⃣ 🚨 WIPE ALL USER DATA FROM RENDER BACKEND
  const wipeAllMemory = async () => {
    setIsWiping(true);
    const token = localStorage.getItem("sva_token");
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMemories([]);
      }
    } catch (error) {
      console.error("Error wiping memories:", error);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="sva-dashboard-wrapper">
      <motion.div className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="title-section">
          <Brain size={32} color="#a855f7" />
          <div>
            <h1>Neural Memory</h1>
            <p>Live synchronized memory for {userName}.</p>
          </div>
        </div>
        <div className="server-status" style={{ color: loading ? '#eab308' : '#22c55e' }}>
          {loading ? <Loader2 size={14} className="spin-loader"/> : <Server size={14} />} 
          {loading ? "Syncing..." : "Backend Synced"}
        </div>
      </motion.div>

      <div className="memory-container">
        
        <div className="add-memory-box">
          <input 
            type="text" 
            placeholder="Tell SVA to remember something manually..." 
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
          />
          <button onClick={handleAddMemory} disabled={loading}><Plus size={18} /> Inject</button>
        </div>

        <div className="memory-list">
          {loading ? (
             <div className="empty-state"><Loader2 size={32} className="spin-loader" color="#a855f7"/></div>
          ) : (
            <AnimatePresence>
              {memories.length > 0 ? (
                memories.map((mem) => (
                  <motion.div 
                    key={mem._id} className="memory-card"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Cpu size={16} color="#06b6d4" className="mem-icon" />
                    <p>{mem.text}</p>
                    <button className="del-btn" onClick={() => handleDelete(mem._id)} title="Erase Memory">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="empty-state">
                  <Brain size={48} color="#3f3f46" />
                  <p>Memory Core is completely empty.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="danger-zone">
          <div className="danger-text">
            <ShieldAlert size={20} color="#ef4444" />
            <div>
              <h3>Wipe Core Memory</h3>
              <p>Permanently erase all your personalized context from SVA's servers.</p>
            </div>
          </div>
          <button className="wipe-btn" onClick={wipeAllMemory} disabled={isWiping || memories.length === 0}>
            {isWiping ? "Erasing Database..." : "Erase All Data"}
          </button>
        </div>
      </div>
    </div>
  );
}