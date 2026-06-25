import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { 
  House, Bot, Brain, ChartColumn, Folder, FlaskConical, 
  Settings, HelpCircle, LogOut, Search, MoreVertical, 
  Sparkles, User, Trash2, MessageSquare, Command 
} from "lucide-react";
import "../styles/sidebar.css";
import { getHistory } from "../services/historyService";

// Hook to close menus when clicking outside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const items = [
  { icon: <House size={18} strokeWidth={1.75} />, name: "Home", id: "home" },
  { icon: <Bot size={18} strokeWidth={1.75} />, name: "Agents", id: "agents" },
  { icon: <Brain size={18} strokeWidth={1.75} />, name: "Memory", id: "memory" },
  { icon: <ChartColumn size={18} strokeWidth={1.75} />, name: "Insights", id: "insights" },
  { icon: <Folder size={18} strokeWidth={1.75} />, name: "Library", id: "library" },
  { icon: <FlaskConical size={18} strokeWidth={1.75} />, name: "Labs", id: "labs" }
];

const SidebarHistoryItem = ({ chat, onSelectChat, setActiveTab, onRemoveChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useOnClickOutside(menuRef, () => setShowMenu(false));

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      try {
        const token = localStorage.getItem("sva_token");
        await axios.delete(`/api/history/${chat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowMenu(false);
        onRemoveChat(chat._id); 
      } catch (error) { 
        console.error("Failed to delete chat:", error); 
      }
    }
  };

  return (
    <div className="history-item" onClick={() => { onSelectChat(chat._id); setActiveTab("home"); }}>
      <div className="history-item-main">
        <span className="history-title">
          {chat.title?.length > 25 ? chat.title.slice(0, 25) + "..." : chat.title || "New Conversation"}
        </span>
      </div>
      <div className="history-more" onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}>
        <MoreVertical size={15} strokeWidth={1.5} color="#71717a" />
      </div>
      {showMenu && (
        <div className="history-dropdown" ref={menuRef} style={historyDropdownStyle}>
          <div onClick={handleDelete} style={deleteItemStyle}>
            <Trash2 size={14} /> Delete
          </div>
        </div>
      )}
    </div>
  );
};

// 🚨 YAHAN ONLOGOUT PROP ADD KIYA HAI
export default function Sidebar({ onNewChat, onSelectChat, activeTab, setActiveTab, refreshTrigger, onLogout }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizing = useRef(false);
  
  const [userData, setUserData] = useState({ name: "User", email: "" });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();

  useOnClickOutside(profileMenuRef, () => setShowProfileMenu(false));

  useEffect(() => {
    const storedUser = localStorage.getItem("sva_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) {
          setUserData({ name: parsedUser.name, email: parsedUser.email || "" });
        }
      } catch (e) {
        console.error("Error parsing user data");
      }
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userName = user.displayName || userData.name ; 
        const userEmail = user.email || "";

        setUserData({ name: userName, email: userEmail });
        
        localStorage.setItem("sva_user", JSON.stringify({ name: userName, email: userEmail }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getHistory();
        if (data.success) setHistory(data.sessions || []);
      } catch (err) { console.log("Failed to fetch history:", err); }
    };
    loadHistory();
  }, [refreshTrigger]); 

  const removeChatFromUI = (chatId) => setHistory(prev => prev.filter(c => c._id !== chatId));

  // 🚨 BULLETPROOF LOGOUT LOGIC
  const handleLogoutClick = async () => {
    if (window.confirm("Log out of SVA?")) {
      try {
        const auth = getAuth();
        await signOut(auth); // 🎯 YEH LINE FIREBASE KO PERMANENTLY KILL KAREGI

        // Apna saara kachra saaf kar do
        localStorage.removeItem("sva_user");
        localStorage.removeItem("sva_token");

        // Agar prop aayi hai toh theek, warna seedha page reload (jo ab Auth pe jayega)
        if (onLogout) {
          onLogout(); 
        } else {
          window.location.reload(); 
        }
      } catch (error) {
        console.error("Firebase logout me error aa gaya:", error);
      }
    }
  };

  const groupHistory = () => {
    const today = []; const yesterday = []; const older = [];
    const todayStr = new Date().toDateString();
    const yestDate = new Date(); yestDate.setDate(yestDate.getDate() - 1);
    const yestStr = yestDate.toDateString();

    const filteredHistory = history.filter(chat => 
      (chat.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredHistory.forEach(chat => {
      if (!chat.createdAt) return older.push(chat);
      const chatStr = new Date(chat.createdAt).toDateString();
      if (chatStr === todayStr) today.push(chat);
      else if (chatStr === yestStr) yesterday.push(chat);
      else older.push(chat);
    });
    return { today, yesterday, older };
  };

  const groupedChats = groupHistory();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 260 && newWidth <= 450) setSidebarWidth(newWidth);
    };
    const stopResize = () => { isResizing.current = false; document.body.style.cursor = "default"; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar-scrollable">
        
       {/* 🚨 UPDATED HEADER WITH ONLY SVG LOGO */}
        <div className="sidebar-header" style={{ padding: '10px 12px 20px 12px' }}>
          <img 
            src="/sva-logo.svg" 
            alt="SVA Logo" 
            className="sva-dynamic-logo"
            style={{ 
              width: '42px', /* Size thoda bada kiya kyunki text nahi hai */
              height: '42px', 
              objectFit: 'contain'
            }} 
          />
        </div>
        <div className="sidebar-actions">
          <button className="btn-start-chat" onClick={() => { onNewChat(); setActiveTab("home"); }}>
            <Sparkles size={15} className="sparkle-icon" /> Start New Chat
          </button>
          
          <div className="arc-search" style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
            <Search size={14} color="#71717a" style={{marginRight: '8px'}}/>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="sidebar-menu">
          {items.map((item) => (
            <div key={item.id} className={`menu-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <div className="menu-icon">{item.icon}</div>
              <span className="menu-label">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="history-section">
          <div className="history-main-label">Recent Chats</div>
          
          {searchQuery && groupedChats.today.length === 0 && groupedChats.yesterday.length === 0 && groupedChats.older.length === 0 && (
            <div style={{ color: '#71717a', fontSize: '13px', padding: '10px 16px' }}>No matches found.</div>
          )}
          
          {groupedChats.today.length > 0 && (
            <div className="history-group">
              <h3 className="history-header">Today</h3>
              {groupedChats.today.map(chat => <SidebarHistoryItem key={chat._id} chat={chat} onSelectChat={onSelectChat} setActiveTab={setActiveTab} onRemoveChat={removeChatFromUI} />)}
            </div>
          )}
          
          {groupedChats.yesterday.length > 0 && (
            <div className="history-group">
              <h3 className="history-header">Yesterday</h3>
              {groupedChats.yesterday.map(chat => <SidebarHistoryItem key={chat._id} chat={chat} onSelectChat={onSelectChat} setActiveTab={setActiveTab} onRemoveChat={removeChatFromUI} />)}
            </div>
          )}
          
          {groupedChats.older.length > 0 && (
            <div className="history-group">
              <h3 className="history-header">Previous</h3>
              {groupedChats.older.map(chat => <SidebarHistoryItem key={chat._id} chat={chat} onSelectChat={onSelectChat} setActiveTab={setActiveTab} onRemoveChat={removeChatFromUI} />)}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-bottom-bar" style={{ position: "relative" }}>
        <div className="profile-anchor" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: "pointer", width: "100%", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px", transition: "background 0.2s" }}>
          <div className="profile-avatar" style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px" }}>
            {userData.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-text" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <span className="profile-name" style={{ fontSize: "14px", fontWeight: "500", color: "#e4e4e7", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {userData.name}
            </span>
            <span className="profile-tier" style={{ fontSize: "11px", color: "#a1a1aa" }}>
              Personal Account
            </span>
          </div>
        </div>

        {showProfileMenu && (
          <div className="profile-dropdown-menu" ref={profileMenuRef} style={dropdownStyle}>
            <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", color: "#fff", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "16px", flexShrink: 0 }}>
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {userData.name}
                </div>
                <div style={{ fontSize: "12px", color: "#a1a1aa", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {userData.email || "User Account"}
                </div>
              </div>
            </div>

            <div style={dividerStyle} />
            <div style={menuItemStyle} onClick={() => { setActiveTab("account"); setShowProfileMenu(false); }}><User size={16} color="#a1a1aa" /> <span>Account</span></div>
            <div className="menu-item-settings" style={menuItemStyle} onClick={() => { setActiveTab("settings"); setShowProfileMenu(false); }}><Settings size={16} color="#a1a1aa" /> <span>Settings</span></div>
            <div style={menuItemStyle} onClick={() => { setActiveTab("feedback"); setShowProfileMenu(false); }}><MessageSquare size={16} color="#a1a1aa" /> <span>Feedback</span></div>
            <div style={menuItemStyle} onClick={() => { setActiveTab("help"); setShowProfileMenu(false); }}><HelpCircle size={16} color="#a1a1aa" /> <span>Help Centre</span></div>
            <div style={menuItemStyle} onClick={() => { setActiveTab("shortcuts"); setShowProfileMenu(false); }}><Command size={16} color="#a1a1aa" /> <span>Shortcuts</span></div>
            <div style={dividerStyle} />
            {/* 🚨 YAHAN CLICK HONE PAR NAYA FUNCTION CALL HOGA */}
            <div style={{ ...menuItemStyle, color: "#f87171" }} onClick={handleLogoutClick}><LogOut size={16} color="#f87171" /> <span>Log Out</span></div>
          </div>
        )}
      </div>
      <div className="sidebar-resizer" onMouseDown={(e) => { e.preventDefault(); isResizing.current = true; }} />
    </div>
  );
}

const dropdownStyle = { position: "absolute", bottom: "calc(100% + 10px)", left: "10px", right: "10px", background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 1000, fontFamily: "'Inter', sans-serif" };
const menuItemStyle = { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", cursor: "pointer", fontSize: "14px", color: "#e4e4e7", transition: "background 0.2s" };
const dividerStyle = { height: "1px", background: "rgba(255,255,255,0.08)", width: "100%" };
const historyDropdownStyle = { position: "absolute", right: "20px", top: "30px", background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.5)", zIndex: 50, overflow: "hidden" };
const deleteItemStyle = { display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", color: "#f87171", fontSize: "13px", cursor: "pointer", fontWeight: "500" };