import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Download, Trash2, HardDrive, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../styles/memory-library.css';

export default function Library() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚨 FETCH LIVE IMAGES FROM BACKEND
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "library"), where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageData = [];
      snapshot.forEach((doc) => {
        imageData.push({ id: doc.id, ...doc.data() });
      });
      setImages(imageData.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚨 DELETE IMAGE FROM BACKEND
  const deleteImage = async (id) => {
    try {
      await deleteDoc(doc(db, "library", id));
    } catch (error) {
      console.error("Error deleting image: ", error);
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
            <motion.div key={img.id} className="library-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="img-wrapper">
                <img src={img.url} alt={img.prompt} loading="lazy" />
                <div className="img-overlay">
                  <a href={img.url} target="_blank" rel="noreferrer" className="icon-btn download" title="Download">
                    <Download size={18} />
                  </a>
                  <button className="icon-btn delete" onClick={() => deleteImage(img.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="img-info">
                <p className="prompt" title={img.prompt}>"{img.prompt}"</p>
                <span className="date">{new Date(img.timestamp).toLocaleDateString()}</span>
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