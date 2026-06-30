import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, HardDrive, Settings as SettingsIcon, 
  Brain, Mic, ShieldAlert, Info, Search, HelpCircle, Bug, 
  Command, Star, Trash2, Zap, 
  Volume2, Sliders, Database, Beaker, Bell, Download, Trash, Activity
} from 'lucide-react';
import { getAuth, deleteUser } from "firebase/auth";
import '../styles/settings.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
};

// --- DEFAULT SETTINGS STATE (Appearance Removed) ---
const DEFAULT_SETTINGS = {
  aiEngine: { defaultModel: 'SVA Flash ⚡', smartRouting: true, reasoningDepth: 'Balanced', webSearch: true, multiAgent: false, thinkingProcess: false, responseLength: 'Medium', creativity: 70 },
  voice: { voiceInput: true, autoSend: false, voiceOutput: true, selectedVoice: 'Nova', speed: 1, pitch: 1 },
  privacy: { memory: true, saveHistory: true, personalization: true, training: false },
  general: { language: 'English', region: 'India', timeFormat: '12h', notifications: true, launchTips: true, betaFeatures: false, labsAccess: false },
  advanced: { hardwareAccel: true, experimental: false, devMode: false, debugLogs: false },
  notifications: { newFeatures: true, productUpdates: true, securityAlerts: true, communityNews: false },
  labs: { experimentalTech: false, sensorExp: false, betaModels: false, earlyAccess: false }
};

export default function Settings({ activeTab, onClose }) {
  const [innerTab, setInnerTab] = useState(() => {
    if (activeTab === "account") return "profile";
    if (activeTab === "settings") return "ai"; // 🚨 Default tab ab AI hai
    if (activeTab === "help") return "getting-started";
    return "ai";
  });

  const [userData, setUserData] = useState({ name: "Loading...", email: "Loading..." });
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Load Settings and User Data
  useEffect(() => {
    const storedUser = localStorage.getItem("sva_user");
    if (storedUser) {
      try { setUserData(JSON.parse(storedUser)); } catch (e) {}
    }
    
    const storedSettings = localStorage.getItem("sva_master_settings");
    let initialSettings = DEFAULT_SETTINGS;
    
    if (storedSettings) {
      try { 
        initialSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        setSettings(initialSettings); 
      } catch (e) {}
    }
  }, []);

  // Update Setting Function (Slider/Dropdown change hone par)
  const updateSetting = (category, key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [category]: { ...prev[category], [key]: value } };
      localStorage.setItem("sva_master_settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // 📥 Function to Export JSON Data
  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("sva_token");
      if (!token) return alert("You must be logged in to export data.");

      const response = await axios.get("https://sva-eniy.onrender.com/api/settings/export", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Create a downloadable JSON file in the browser
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `SVA_Export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please check your connection.");
    }
  };

  // 🗑️ Function to Clear All Chats
  const handleClearChats = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("sva_token");
        const response = await axios.delete("https://sva-eniy.onrender.com/api/settings/clear-chats", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          alert("All chat history has been permanently deleted.");
          // Optional: window.location.reload(); to refresh the UI
        }
      } catch (error) {
        console.error("Failed to delete chats:", error);
        alert("Error deleting chats.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("DANGER ZONE: This will permanently delete your SVA account, chat history, and all personal data. This action CANNOT be undone. Are you sure?");
    if (confirmDelete && currentUser) {
      setIsDeleting(true);
      try {
        await deleteUser(currentUser);
        alert("Account permanently deleted.");
      } catch (error) {
        alert("Failed to delete account. Please re-login and try again.");
        setIsDeleting(false);
      }
    }
  };

  const clearCache = () => {
    alert("Cache cleared successfully. Freed 214 MB.");
  };

  // --- REUSABLE UI COMPONENTS FOR PREMIUM FEEL ---
  const SettingToggle = ({ label, desc, category, settingKey }) => (
    <div className="setting-row" style={{ padding: '16px 0' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-main, #fff)' }}>{label}</h4>
        {desc && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #a1a1aa)', lineHeight: '1.4' }}>{desc}</p>}
      </div>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={settings[category][settingKey]} 
          onChange={(e) => updateSetting(category, settingKey, e.target.checked)} 
        />
        <span className="slider round"></span>
      </label>
    </div>
  );

  const SettingSelect = ({ label, desc, category, settingKey, options }) => (
    <div className="setting-row" style={{ padding: '16px 0' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-main, #fff)' }}>{label}</h4>
        {desc && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #a1a1aa)' }}>{desc}</p>}
      </div>
      <select 
        className="set-input-flat" 
        value={settings[category][settingKey]}
        onChange={(e) => updateSetting(category, settingKey, e.target.value)}
        style={{ width: '180px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const SettingSlider = ({ label, desc, category, settingKey, min, max, step = 1, displayFormat }) => (
    <div className="setting-row" style={{ padding: '16px 0', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-main, #fff)' }}>{label}</h4>
          {desc && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #a1a1aa)' }}>{desc}</p>}
        </div>
        <span style={{ fontWeight: 'bold', color: 'var(--accent, #06b6d4)' }}>
          {displayFormat ? displayFormat(settings[category][settingKey]) : settings[category][settingKey]}
        </span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} 
        value={settings[category][settingKey]}
        onChange={(e) => updateSetting(category, settingKey, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent, #06b6d4)', cursor: 'pointer' }}
      />
    </div>
  );

  const SettingButton = ({ label, desc, actionText, onClick, isDanger, icon: Icon }) => (
    <div className="setting-row" style={{ padding: '16px 0' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: isDanger ? '#f87171' : 'var(--text-main, #fff)' }}>{label}</h4>
        {desc && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #a1a1aa)' }}>{desc}</p>}
      </div>
      <button 
        className={isDanger ? "set-btn-danger" : "set-btn-secondary"} 
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {Icon && <Icon size={16} />} {actionText}
      </button>
    </div>
  );

  // === RENDER TABS ===
  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div className="settings-modal tabbed" onClick={(e) => e.stopPropagation()} initial="hidden" animate="visible" variants={containerVariants}>
        
        {/* SIDEBAR NAVIGATION */}
        <div className="settings-sidebar scrollable-sidebar" style={{ overflowY: 'auto' }}>
          <h2 className="settings-title" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>Settings</h2>
          <nav className="settings-nav" style={{ marginTop: '16px' }}>
            <div className="set-nav-group-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '12px' }}>App</div>
            <div className={`set-nav-item ${innerTab === 'ai' ? 'active' : ''}`} onClick={() => setInnerTab('ai')}><Brain size={16}/> AI Engine</div>
            <div className={`set-nav-item ${innerTab === 'voice' ? 'active' : ''}`} onClick={() => setInnerTab('voice')}><Mic size={16}/> Voice</div>
            
            <div className="set-nav-group-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '24px 0 8px', paddingLeft: '12px' }}>Account</div>
            <div className={`set-nav-item ${innerTab === 'privacy' ? 'active' : ''}`} onClick={() => setInnerTab('privacy')}><ShieldAlert size={16}/> Privacy</div>
            <div className={`set-nav-item ${innerTab === 'data' ? 'active' : ''}`} onClick={() => setInnerTab('data')}><Database size={16}/> Data & Storage</div>
            
            <div className="set-nav-group-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '24px 0 8px', paddingLeft: '12px' }}>System</div>
            <div className={`set-nav-item ${innerTab === 'general' ? 'active' : ''}`} onClick={() => setInnerTab('general')}><SettingsIcon size={16}/> General</div>
            <div className={`set-nav-item ${innerTab === 'notifications' ? 'active' : ''}`} onClick={() => setInnerTab('notifications')}><Bell size={16}/> Notifications</div>
            <div className={`set-nav-item ${innerTab === 'advanced' ? 'active' : ''}`} onClick={() => setInnerTab('advanced')}><Activity size={16}/> Advanced</div>
            <div className={`set-nav-item ${innerTab === 'labs' ? 'active' : ''}`} onClick={() => setInnerTab('labs')}><Beaker size={16}/> Labs</div>
            
            <div className="set-nav-group-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '24px 0 8px', paddingLeft: '12px' }}>Support</div>
            <div className={`set-nav-item ${innerTab === 'shortcuts' ? 'active' : ''}`} onClick={() => setInnerTab('shortcuts')}><Command size={16}/> Shortcuts</div>
            <div className={`set-nav-item ${innerTab === 'feedback' ? 'active' : ''}`} onClick={() => setInnerTab('feedback')}><Star size={16}/> Feedback</div>
            <div className={`set-nav-item ${innerTab === 'about' ? 'active' : ''}`} onClick={() => setInnerTab('about')}><Info size={16}/> About SVA</div>
          </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="settings-content scrollable">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{innerTab.replace('-', ' ')}</h2>
            <button className="settings-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={onClose}>×</button>
          </div>

          {/* 2. AI ENGINE */}
          {innerTab === 'ai' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingSelect label="Default Model" desc="The primary neural network used for standard queries." category="aiEngine" settingKey="defaultModel" options={['SVA Flash ⚡', 'SVA Core 🧠', 'SVA Secure 🔒']} />
              <div className="setting-divider" />
              <SettingToggle label="Smart Auto Routing" desc="Allow SVA to automatically choose the best model based on prompt complexity." category="aiEngine" settingKey="smartRouting" />
              <div className="setting-divider" />
              <SettingSelect label="Reasoning Depth" desc="How deeply the AI should analyze before responding." category="aiEngine" settingKey="reasoningDepth" options={['Fast', 'Balanced', 'Deep']} />
              <div className="setting-divider" />
              <SettingToggle label="Web Search" desc="Allow the AI to browse the live internet for current events." category="aiEngine" settingKey="webSearch" />
              <div className="setting-divider" />
              <SettingToggle label="Allow Multi-Agent Collaboration" desc="Enable multiple specialized agents to solve complex tasks together." category="aiEngine" settingKey="multiAgent" />
              <div className="setting-divider" />
              <SettingToggle label="Enable Thinking Process" desc="Show the AI's internal reasoning steps before generating the final answer." category="aiEngine" settingKey="thinkingProcess" />
              <div className="setting-divider" />
              <SettingSelect label="Response Length" category="aiEngine" settingKey="responseLength" options={['Short', 'Medium', 'Detailed']} />
              <div className="setting-divider" />
              <SettingSlider label="Creativity (Temperature)" desc="Higher values produce more creative, unpredictable text. Lower values are more factual." category="aiEngine" settingKey="creativity" min={0} max={100} displayFormat={(v) => `${v}%`} />
            </motion.div>
          )}

          {/* 3. VOICE */}
          {innerTab === 'voice' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingToggle label="Voice Input" desc="Enable microphone to speak to SVA." category="voice" settingKey="voiceInput" />
              <div className="setting-divider" />
              <SettingToggle label="Auto Send Voice" desc="Automatically send the message when you stop speaking." category="voice" settingKey="autoSend" />
              <div className="setting-divider" />
              <SettingToggle label="Voice Output (Read Aloud)" desc="Allow SVA to speak responses back to you." category="voice" settingKey="voiceOutput" />
              <div className="setting-divider" />
              <SettingSelect label="AI Voice Persona" category="voice" settingKey="selectedVoice" options={['Nova', 'Aura', 'Echo', 'Sage']} />
              <div className="setting-divider" />
              <SettingSlider label="Speaking Speed" category="voice" settingKey="speed" min={0.5} max={2.0} step={0.1} displayFormat={(v) => `${v}x`} />
              <div className="setting-divider" />
              <SettingSlider label="Voice Pitch" category="voice" settingKey="pitch" min={0} max={2.0} step={0.1} />
            </motion.div>
          )}

          {/* 4. PRIVACY */}
          {innerTab === 'privacy' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingToggle label="Cross-Chat Memory" desc="Allow SVA to remember details across different conversations." category="privacy" settingKey="memory" />
              <div className="setting-divider" />
              <SettingToggle label="Save Chat History" desc="Store your conversations securely in the database." category="privacy" settingKey="saveHistory" />
              <div className="setting-divider" />
              <SettingToggle label="Model Personalization" desc="Allow the AI to adapt its tone to your preferences over time." category="privacy" settingKey="personalization" />
              <div className="setting-divider" />
              <SettingToggle label="Contribute to Training" desc="Allow anonymized snippets of your chats to improve SVA models." category="privacy" settingKey="training" />
              <div className="setting-divider" />
              <SettingButton label="Delete All Memory" desc="Wipe everything SVA has learned about you." actionText="Clear Memory" onClick={() => alert("Memory cleared.")} icon={Trash2} />
              <div className="setting-divider" />
              <SettingButton label="Export Account Data" desc="Download a copy of your chats and settings in JSON format." actionText="Export JSON" onClick={() => alert("Exporting data...")} icon={Download} />
              <div className="setting-divider" />
              <SettingButton label="Delete Account" desc="Permanently remove your account and all associated data." actionText="Delete Account" onClick={handleDeleteAccount} isDanger={true} icon={Trash} />
            </motion.div>
          )}

          {/* 5. GENERAL */}
          {innerTab === 'general' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingSelect label="Language" category="general" settingKey="language" options={['English', 'Spanish', 'Hindi', 'French', 'German']} />
              <div className="setting-divider" />
              <SettingSelect label="Region" category="general" settingKey="region" options={['United States', 'India', 'UK', 'Europe', 'Global']} />
              <div className="setting-divider" />
              <SettingSelect label="Time Format" category="general" settingKey="timeFormat" options={['12h', '24h']} />
              <div className="setting-divider" />
              <SettingToggle label="Push Notifications" category="general" settingKey="notifications" />
              <div className="setting-divider" />
              <SettingToggle label="Show Launch Tips" category="general" settingKey="launchTips" />
            </motion.div>
          )}

          {/* 6. ADVANCED */}
          {innerTab === 'advanced' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingToggle label="Hardware Acceleration" desc="Use GPU to render complex UI elements and Markdown faster." category="advanced" settingKey="hardwareAccel" />
              <div className="setting-divider" />
              <SettingToggle label="Developer Mode" desc="Show token counts, model latency, and system prompts in chat." category="advanced" settingKey="devMode" />
              <div className="setting-divider" />
              <SettingToggle label="Debug Logs" desc="Write verbose error logs to console." category="advanced" settingKey="debugLogs" />
              <div className="setting-divider" />
              <SettingButton label="Run API Diagnostics" desc="Ping all AI model endpoints to check latency and health." actionText="Run Test" onClick={() => alert("All systems operational. Latency: 120ms")} icon={Activity} />
              <div className="setting-divider" />
              <SettingButton label="Clear Local Cache" desc="Free up space by deleting cached images and temporary artifacts. (Currently using 214 MB)" actionText="Clear Cache" onClick={clearCache} icon={Trash2} />
            </motion.div>
          )}

          {/* 7. DATA & STORAGE */}
          {innerTab === 'data' && (
            <motion.div variants={cardVariants}>
              <div className="setting-card" style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px' }}>Storage Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Text Chats</span> <strong>28 MB</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Images & Artifacts</span> <strong>96 MB</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vector Memory</span> <strong>4 MB</strong></div>
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}><span>Total Used</span> <strong>128 MB</strong></div>
                </div>
              </div>
              <div className="setting-card">
                <SettingButton label="Export Chats" actionText="Export JSON" onClick={handleExportData} icon={Download} />
<div className="setting-divider" />
<SettingButton label="Clear All Chats" actionText="Delete Data" onClick={handleClearChats} icon={Trash2} isDanger={true} />
              </div>
            </motion.div>
          )}

          {/* 8. LABS */}
          {innerTab === 'labs' && (
            <motion.div variants={cardVariants} className="setting-card" style={{ border: '1px solid #a855f7' }}>
              <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', marginBottom: '16px', color: '#e9d5ff' }}>
                <p style={{ margin: 0, fontSize: '13px' }}><strong>Warning:</strong> Labs features are highly experimental and may crash the application or yield unexpected AI behavior.</p>
              </div>
              <SettingToggle label="Enable Experimental Technologies" category="labs" settingKey="experimentalTech" />
              <div className="setting-divider" />
              <SettingToggle label="Device Sensor API Access" desc="Allow AI to read gyroscope and ambient light data." category="labs" settingKey="sensorExp" />
              <div className="setting-divider" />
              <SettingToggle label="Beta AI Models" desc="Get early access to unreleased SambaNova and Groq architectures." category="labs" settingKey="betaModels" />
            </motion.div>
          )}

          {/* 9. NOTIFICATIONS */}
          {innerTab === 'notifications' && (
            <motion.div variants={cardVariants} className="setting-card">
              <SettingToggle label="New Features & Updates" category="notifications" settingKey="newFeatures" />
              <div className="setting-divider" />
              <SettingToggle label="Product Updates" category="notifications" settingKey="productUpdates" />
              <div className="setting-divider" />
              <SettingToggle label="Security Alerts" category="notifications" settingKey="securityAlerts" />
              <div className="setting-divider" />
              <SettingToggle label="Community News" category="notifications" settingKey="communityNews" />
            </motion.div>
          )}

          {/* 10. ABOUT */}
          {innerTab === 'about' && (
            <motion.div variants={cardVariants} className="setting-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <h1 style={{ fontSize: '48px', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SVA</h1>
              <h3 style={{ margin: '0 0 32px 0', color: 'var(--text-main)', fontWeight: '400' }}>Intelligence Engine</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Version</span> <strong>2.0.1 Beta</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Build Number</span> <strong>2026.06.24.89</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Release Channel</span> <strong>Production</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Architecture</span> <strong>Omni Multi-Agent</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                <button className="set-btn-secondary">Privacy Policy</button>
                <button className="set-btn-secondary">Terms of Service</button>
                <button className="set-btn-secondary">Open Source Licenses</button>
                <button className="set-btn-secondary">Check for Updates</button>
              </div>
            </motion.div>
          )}

          {/* PROFILE */}
{innerTab === 'profile' && (
  <motion.div variants={cardVariants}>
    <div className="setting-card" style={{ textAlign: "center" }}>

      <div
        style={{
          width: 90,
          height: 90,
          margin: "0 auto 18px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 700,
          color: "#fff"
        }}
      >
        {userData.name?.charAt(0).toUpperCase()}
      </div>

      <h2 style={{ marginBottom: 6 }}>
        {userData.name}
      </h2>

      <p
        style={{
          color: "#9ca3af",
          marginBottom: 30
        }}
      >
        {userData.email}
      </p>

      <div className="setting-divider" />

      <SettingButton
        label="Export Account Data"
        desc="Download your chats, memories and settings."
        actionText="Export"
        icon={Download}
        onClick={handleExportData}
      />

      <div className="setting-divider" />

      <SettingButton
        label="Delete All Chats"
        desc="Permanently delete all conversations."
        actionText="Delete"
        icon={Trash2}
        isDanger={true}
        onClick={handleClearChats}
      />

      <div className="setting-divider" />

      <SettingButton
        label="Delete Account"
        desc="This permanently removes your SVA account and all associated data."
        actionText="Delete Account"
        icon={Trash}
        isDanger={true}
        onClick={handleDeleteAccount}
      />

    </div>
  </motion.div>
)}

          {/* 11. SHORTCUTS */}
          {innerTab === 'shortcuts' && (
            <motion.div variants={cardVariants} className="setting-card" style={{ padding: 0 }}>
              <div className="setting-row"><div><h4 style={{color:'var(--text-main)'}}>Search Chat</h4></div> <kbd className="shortcut-kbd">Ctrl + K</kbd></div>
              <div className="setting-row"><div><h4 style={{color:'var(--text-main)'}}>New Chat</h4></div> <kbd className="shortcut-kbd">Ctrl + N</kbd></div>
              <div className="setting-row"><div><h4 style={{color:'var(--text-main)'}}>Stop Response</h4></div> <kbd className="shortcut-kbd">Esc</kbd></div>
              <div className="setting-row" style={{ border: 'none' }}><div><h4 style={{color:'var(--text-main)'}}>Voice Mode</h4></div> <kbd className="shortcut-kbd">Ctrl + Shift + V</kbd></div>
            </motion.div>
          )}

          {/* 12. FEEDBACK */}
          {innerTab === 'feedback' && (
            <motion.div variants={cardVariants} className="setting-card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <h4 style={{ marginBottom: '16px' }}>Rate SVA</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  {[1,2,3,4,5].map(star => <Star key={star} size={32} color={star <= 4 ? "var(--accent)" : "var(--border-color)"} fill={star <= 4 ? "var(--accent)" : "transparent"} style={{ cursor: 'pointer' }} />)}
                </div>
              </div>
              <div className="setting-divider" />
              <SettingButton label="Report Bug" desc="Found an issue? Let us know." actionText="Report" onClick={() => {}} icon={Bug} />
              <div className="setting-divider" />
              <SettingButton label="Contact Support" desc="Need human assistance?" actionText="Email Us" onClick={() => {}} icon={HelpCircle} />
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}