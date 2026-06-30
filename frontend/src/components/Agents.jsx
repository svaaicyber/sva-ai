import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Sparkles, BookOpen, Briefcase, Calendar, Globe, Plus, CheckCircle2, Cpu, X, User, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../styles/agents.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

// Default SVA Agents
const defaultAgentsList = [
  { id: "sva-core", name: "SVA Core (Default)", icon: <Cpu size={28} className="agt-white-text" />, glowClass: "agt-white-glow", btnClass: "agt-btn-white", desc: "The standard multi-purpose AI experience. Balanced for general tasks, quick questions, and daily assistance.", tags: ["General", "Fast", "Balanced"] },
  { id: "creative-writer", name: "The Wordsmith", icon: <Sparkles size={28} className="agt-purple-text" />, glowClass: "agt-purple-glow", btnClass: "agt-btn-purple", desc: "Your co-writer for viral social media hooks, professional emails, blogs, and creative storytelling.", tags: ["Writing", "Emails", "Content"] },
  { id: "tech-companion", name: "The Code Companion", icon: <Terminal size={28} className="agt-cyan-text" />, glowClass: "agt-cyan-glow", btnClass: "agt-btn-cyan", desc: "A programming buddy to help you write clean code, debug syntax errors, and explain complex tech logic.", tags: ["Coding", "Web Dev", "Debugging"] },
  { id: "universal-scholar", name: "The Scholar", icon: <BookOpen size={28} className="agt-pink-text" />, glowClass: "agt-pink-glow", btnClass: "agt-btn-pink", desc: "An academic tutor built to simplify complex topics (ELI5), summarize long PDFs, and help with research.", tags: ["Education", "Summary", "ELI5"] },
  { id: "career-coach", name: "The Career Coach", icon: <Briefcase size={28} className="agt-emerald-text" />, glowClass: "agt-emerald-glow", btnClass: "agt-btn-emerald", desc: "Expert guidance for ATS-friendly resumes, tailored cover letters, and mock interview preparations.", tags: ["Resume", "Interviews", "Jobs"] },
  { id: "life-planner", name: "The Life Planner", icon: <Calendar size={28} className="agt-amber-text" />, glowClass: "agt-amber-glow", btnClass: "agt-btn-amber", desc: "Organize your life. Generates travel itineraries, weekly meal plans, workout routines, and daily schedules.", tags: ["Travel", "Fitness", "Schedules"] },
  { id: "global-linguist", name: "The Linguist", icon: <Globe size={28} className="agt-blue-text" />, glowClass: "agt-blue-glow", btnClass: "agt-btn-blue", desc: "Seamless translations, grammar corrections, and conversational practice for learning new languages.", tags: ["Translation", "Grammar", "Languages"] }
];

export default function Agents({ activeAgent, onSelectAgent }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customAgent, setCustomAgent] = useState({ name: '', description: '', prompt: '' });
  
  const [customAgentsList, setCustomAgentsList] = useState([]);

  // 📥 Fetch Custom Agents
  const fetchCustomAgents = async () => {
    try {
      let token = localStorage.getItem('sva_token') || "temp_dev_token";
      const res = await axios.get('https://sva-eniy.onrender.com/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data.success) {
        setCustomAgentsList(res.data.data || res.data.agents || []);
      }
    } catch (error) {
      console.error("Failed to fetch custom agents:", error);
    }
  };

  useEffect(() => {
    fetchCustomAgents();
  }, []);

  // ➕ Create Custom Agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem('sva_token') || "temp_dev_token";

      const response = await axios.post('https://sva-eniy.onrender.com/api/agents/create', {
        name: customAgent.name,
        description: customAgent.description,
        systemPrompt: customAgent.prompt,
        createdBy: "user_firebase_id_here" 
      }, {
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (response.status === 200 || response.status === 201) {
        setShowCreateModal(false);
        setCustomAgent({ name: '', description: '', prompt: '' });
        fetchCustomAgents(); 
      } else {
        alert("Backend ne request accept ki par agent save nahi hua. Console check kar.");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert(error.response ? `Error: ${error.response.data.message}` : "Server connection failed!");
    }
  };

  // 🗑️ Delete Custom Agent
  const handleDeleteAgent = async (e, agentId) => {
    e.stopPropagation(); // Card pe click trigger hone se rokne ke liye
    
    if (window.confirm("Are you sure you want to delete this custom agent?")) {
      try {
        let token = localStorage.getItem('sva_token') || "temp_dev_token";
        
        const response = await axios.delete(`https://sva-eniy.onrender.com/api/agents/${agentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          if (activeAgent === agentId) {
            onSelectAgent("sva-core"); // Agar active agent delete hua toh core pe wapas bhej do
          }
          fetchCustomAgents(); // List refresh
        }
      } catch (error) {
        console.error("Failed to delete agent:", error);
        alert("Delete failed! Backend error.");
      }
    }
  };

  // 🔄 Combine Default and Custom Agents for rendering
  const allAgents = [
    ...defaultAgentsList.map(agent => ({ ...agent, isCustom: false })), // Tag as default
    ...customAgentsList.map(agent => ({
      id: agent._id, 
      name: agent.name, 
      icon: <User size={28} className="agt-white-text" />, 
      glowClass: "agt-white-glow", 
      btnClass: "agt-btn-white", 
      desc: agent.description, 
      tags: ["Custom", "User Trained"],
      isCustom: true // 🚨 Tag as custom to show delete button
    }))
  ];

  return (
    <motion.div className="agt-wrapper" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="agt-container">
        
        <motion.div className="agt-header" variants={cardVariants}>
          <div className="agt-header-title">
            <Sparkles className="agt-purple-text" size={28} />
            <h1>SVA Core Agents</h1>
          </div>
          <p className="agt-subtitle">Select a specialized neural pathway or train your own.</p>
        </motion.div>

        <motion.div className="agt-grid" variants={containerVariants}>
          
          {/* 🚨 DYNAMIC AGENT LIST RENDERING */}
          {allAgents.map((agent) => (
            <motion.div 
              key={agent.id} 
              className={`agt-card ${activeAgent === agent.id ? 'agt-card-active' : ''} ${agent.glowClass}`}
              variants={cardVariants}
              onClick={() => onSelectAgent(agent.id)}
            >
              <div className="agt-card-header">
                <div className="agt-icon-box">{agent.icon}</div>
                
                {/* 🚨 ACTIVE ICON & DELETE BUTTON WRAPPER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {agent.isCustom && (
                    <div 
                      onClick={(e) => handleDeleteAgent(e, agent.id)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#f87171', padding: '6px', borderRadius: '6px', background: 'rgba(248, 113, 113, 0.1)' }}
                      title="Delete Custom Agent"
                    >
                      <Trash2 size={16} />
                    </div>
                  )}
                  {activeAgent === agent.id && <CheckCircle2 size={20} className="agt-active-icon" />}
                </div>
              </div>
              
              <h2>{agent.name}</h2>
              <p>{agent.desc}</p>
              
              <div className="agt-tags">
                {agent.tags.map((tag, i) => (
                  <span key={i} className="agt-tag">{tag}</span>
                ))}
              </div>

              <button className={`agt-action-btn ${agent.btnClass}`}>
                {activeAgent === agent.id ? "Agent Active" : "Initialize"}
              </button>
            </motion.div>
          ))}

          {/* ➕ CREATE CUSTOM AGENT BUTTON */}
          <motion.div 
            className="agt-card agt-card-dashed" 
            variants={cardVariants}
            onClick={() => setShowCreateModal(true)} 
            style={{ cursor: 'pointer' }}
          >
            <div className="agt-create-content">
              <div className="agt-icon-box agt-dashed-icon">
                <Plus size={28} color="#94a3b8" />
              </div>
              <h2>Create Custom Agent</h2>
              <p>Train a new SVA instance with custom datasets, specific instructions, and behavioral parameters.</p>
            </div>
          </motion.div>

        </motion.div>
        <div className="agt-spacer"></div>
      </div>

      {/* 🚀 THE CREATION MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="agt-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <motion.div 
              className="agt-create-modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="agt-modal-header">
                <h2>Create Custom Agent</h2>
                <button className="agt-close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCreateAgent} className="agt-form">
                <div className="agt-input-group">
                  <label>Agent Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Code Reviewer Bot" 
                    value={customAgent.name}
                    onChange={(e) => setCustomAgent({...customAgent, name: e.target.value})}
                  />
                </div>
                
                <div className="agt-input-group">
                  <label>Short Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="What does this agent do?" 
                    value={customAgent.description}
                    onChange={(e) => setCustomAgent({...customAgent, description: e.target.value})}
                  />
                </div>

                <div className="agt-input-group">
                  <label>System Instructions (The Brain)</label>
                  <textarea 
                    required
                    rows="5"
                    placeholder="You are an expert at... Always respond with..." 
                    value={customAgent.prompt}
                    onChange={(e) => setCustomAgent({...customAgent, prompt: e.target.value})}
                  ></textarea>
                </div>

                <div className="agt-modal-actions">
                  <button type="button" className="agt-btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="agt-btn-submit">Create Agent</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}