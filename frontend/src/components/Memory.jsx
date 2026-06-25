import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trash2, Plus, Server, ShieldAlert, Cpu, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Update path if needed
import '../styles/memory-library.css';

export default function Memory() {
  const [newMemory, setNewMemory] = useState("");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWiping, setIsWiping] = useState(false);

  // 🚨 LIVE BACKEND SYNC
  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in!");
      setLoading(false);
      return;
    }

    // Create a query against the collection only for THIS user
    const q = query(collection(db, "memories"), where("userId", "==", user.uid));
    
    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memoryData = [];
      snapshot.forEach((doc) => {
        memoryData.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      setMemories(memoryData.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // 🚨 ADD DATA TO BACKEND
  const handleAddMemory = async () => {
    if (!newMemory.trim() || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, "memories"), {
        text: newMemory,
        userId: auth.currentUser.uid, // Tagging with User ID
        type: "user_added",
        timestamp: Date.now()
      });
      setNewMemory("");
    } catch (error) {
      console.error("Error adding memory: ", error);
    }
  };

  // 🚨 DELETE DATA FROM BACKEND
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "memories", id));
    } catch (error) {
      console.error("Error deleting memory: ", error);
    }
  };

  // 🚨 WIPE ALL USER DATA FROM BACKEND
  const wipeAllMemory = async () => {
    if (!auth.currentUser) return;
    setIsWiping(true);
    try {
      const q = query(collection(db, "memories"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, "memories", document.id)));
      });

      await Promise.all(deletePromises); // Wait for all deletions to finish
    } catch (error) {
      console.error("Error wiping memories: ", error);
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
            <p>Live synchronized memory for {auth.currentUser?.displayName || "User"}.</p>
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
                    key={mem.id} className="memory-card"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Cpu size={16} color="#06b6d4" className="mem-icon" />
                    <p>{mem.text}</p>
                    <button className="del-btn" onClick={() => handleDelete(mem.id)} title="Erase Memory">
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