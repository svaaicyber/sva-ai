import React, { useRef, useEffect, useState } from "react";
import { Mic, SendHorizontal, Plus, Square, Image, Search, FileText, Code2, PhoneCall, Cpu, Shield, Zap, BrainCircuit, Check } from "lucide-react";
import "../styles/commandBar.css";
import ChatMessage from "./ChatMessage";

export default function CommandBar({
  activeAgent,
  selectedModel,   
  onModelChange,   
  chatStarted,
  input,
  setInput,
  messages,
  loading,
  onSend,
  onCallTrigger,
  onRegenerate,
  onStopResponse
}) {
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null); // 🚨 Ref for Auto-resizing textarea
  
  const [attachment, setAttachment] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [borderColor, setBorderColor] = useState("rgba(255, 255, 255, 0.1)");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🚨 Reset textarea height when input clears (e.g. after sending)
  useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.style.height = "24px"; 
    }
  }, [input]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  const handleSendTrigger = () => {
    if (!input.trim() && !attachment) return;
    onSend(input, attachment);
    setAttachment(null);
  };

  // 🚨 Handle Auto-Resize of Textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px"; // Reset to calculate actual height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`; // Max height 150px
    }
  };

  // 🚨 Handle Enter (Send) vs Shift+Enter (New Line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Sirf PC/Laptop (width > 768px) pe bina Shift ke Enter dabane par send hoga
      if (window.innerWidth > 768 && !e.shiftKey) {
        e.preventDefault(); 
        handleSendTrigger();
      }
      // Mobile pe automatically next line chala jayega (default behavior)
    }
  };

  const activateTool = (tool) => {
    setToolsOpen(false);
    switch (tool) {
      case "image": setInput("Create an image of "); break;
      case "research": setInput("Research deeply about "); break;
      case "file": fileInputRef.current?.click(); break;
      case "code": setInput("Help me build "); break;
      default: break;
    }
    if(textareaRef.current) textareaRef.current.focus();
  };

  const selectModel = (modelName) => {
    if(onModelChange) onModelChange(modelName);
    setToolsOpen(false);
  };

  const randomizeBorderColor = () => {
    const colors = ['#06b6d4', '#a855f7', '#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6', '#ffffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBorderColor(randomColor);
  };

  return (
    <>
      {/* ==========================================
          CHAT HISTORY
      ========================================== */}
      {chatStarted && (
        <div className="chat-history-container" style={{ paddingBottom: '120px' }}>
          {messages.length > 0 && <div style={{ height: "90px", width: "100%", flexShrink: 0 }}></div>}
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index} 
              message={msg} 
              onRegenerate={() => onRegenerate(index)} /* 🚨 Yahan index pass kiya */ 
              setInput={setInput} 
            />
          ))}
          {loading && (
            <div className="chat-bubble-wrapper ai-wrapper" style={{ padding: "0 16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#a855f7", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>SVA</div>
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={chatEndRef} className="scroll-anchor" />
        </div>
      )}

      {/* ==========================================
          COMMAND BAR
      ========================================== */}
      <div
        className={`chat-section ${chatStarted ? "chat-started" : ""}`}
        style={{ width: "850px", maxWidth: "95vw", margin: "0 auto", position: "relative", zIndex: 100 }}
      >
        
        {/* 🛠️ MEGA MENU POPUP */}
        {toolsOpen && (
          <div className="tools-menu-popup" style={popupStyle}>
            <div className="menu-section-title">Tools</div>
            <button style={toolBtnStyle} onClick={() => activateTool("image")}><Image size={16} color="#a855f7" /> SVA Vision</button>
            <button style={toolBtnStyle} onClick={() => activateTool("research")}><Search size={16} color="#06b6d4" /> Web Research</button>
            <button style={toolBtnStyle} onClick={() => activateTool("file")}><FileText size={16} color="#22c55e" /> Analyze Document</button>
            <button style={toolBtnStyle} onClick={() => activateTool("code")}><Code2 size={16} color="#eab308" /> Code Generator</button>

            <div className="menu-divider" />
            
            <div className="menu-section-title">AI Engine</div>
            <button style={selectedModel === "SVA Flash" ? activeModelBtnStyle : modelBtnStyle} onClick={() => selectModel("SVA Flash")}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedModel === "SVA Flash" ? '#fff' : '#e2e8f0' }}><Zap size={15} color="#eab308"/> SVA Flash</div>
                {selectedModel === "SVA Flash" && <Check size={14} color="#06b6d4" />}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Groq Engine • Instant</span>
            </button>
            
            <button style={selectedModel === "SVA Core" ? activeModelBtnStyle : modelBtnStyle} onClick={() => selectModel("SVA Core")}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedModel === "SVA Core" ? '#fff' : '#e2e8f0' }}><BrainCircuit size={15} color="#06b6d4"/> SVA Core</div>
                {selectedModel === "SVA Core" && <Check size={14} color="#06b6d4" />}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sambanova • Deep Logic</span>
            </button>
            
            <button style={selectedModel === "SVA Secure" ? activeModelBtnStyle : modelBtnStyle} onClick={() => selectModel("SVA Secure")}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedModel === "SVA Secure" ? '#fff' : '#e2e8f0' }}><Shield size={15} color="#22c55e"/> SVA Secure</div>
                {selectedModel === "SVA Secure" && <Check size={14} color="#06b6d4" />}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ollama • 100% Private</span>
            </button>
          </div>
        )}

        {/* PILL SHAPED MAIN COMMAND BAR */}
        <div 
          className="command-bar-inner" 
          onClick={randomizeBorderColor}
          style={{ 
            width: "100%", boxSizing: "border-box", border: `2px solid ${borderColor}`,
            boxShadow: `0 0 15px ${borderColor}40`, transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
          }}
        >
          {activeAgent && activeAgent !== "sva-core" && (
            <div className="agent-badge" style={badgeStyle}>⚡ System Override: {activeAgent.replace("-", " ")}</div>
          )}

          {attachment && (
            <div className="attachment-preview" style={{ marginBottom: "8px", marginTop: "8px", marginLeft: "12px" }}>
              <span>📄 {attachment.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setAttachment(null); }}>✕</button>
            </div>
          )}

          {/* INPUT ROW */}
          <div className="input-row" style={{ display: "flex", width: "100%", alignItems: "flex-end", gap: "8px", marginTop: activeAgent && activeAgent !== "sva-core" ? "8px" : "0" }}>
            
            <button
              className="action-btn plus-btn"
              onClick={(e) => { e.stopPropagation(); setToolsOpen(!toolsOpen); }}
              style={{ transition: "transform 0.2s", transform: toolsOpen ? "rotate(45deg)" : "none", marginBottom: "4px" }}
              title="Tools & Models"
            >
              <Plus size={22} color="#fff" />
            </button>

            {/* 🚨 MULTILINE TEXTAREA REPLACING INPUT */}
            <textarea
              ref={textareaRef}
              className="command-input"
              style={{ flex: 1, width: "100%" }}
              placeholder={!chatStarted ? "Ask SVA anything..." : "Message SVA..."}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />

            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/*,.pdf,.txt,.js,.py,.cpp" />

            <div className="action-buttons" style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
              <button className="action-btn" title="Live Voice Call" onClick={(e) => { e.stopPropagation(); onCallTrigger(); }}>
                <PhoneCall size={20} color="#a1a1aa" />
              </button>
              <button className="action-btn" title="Voice Input" onClick={(e) => e.stopPropagation()}>
                <Mic size={20} color="#a1a1aa" />
              </button>
              <button
                className="send-btn"
                onClick={(e) => { e.stopPropagation(); loading ? onStopResponse() : handleSendTrigger(); }}
                title={loading ? "Stop Generating" : "Send Message"}
              >
                {loading ? <Square size={16} fill="currentColor" /> : <SendHorizontal size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ... (All inline styles remain exactly the same as your code) ...
const popupStyle = { position: "absolute", bottom: "calc(100% + 20px)", left: "0", display: "flex", flexDirection: "column", gap: "6px", background: "rgba(18, 18, 24, 0.98)", backdropFilter: "blur(20px)", padding: "16px", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 15px 50px rgba(0,0,0,0.8)", zIndex: 9999, minWidth: "260px" };
const toolBtnStyle = { display: "flex", alignItems: "center", gap: "10px", background: "transparent", color: "#fff", border: "none", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", whiteSpace: "nowrap", fontSize: "14px", fontWeight: "500", transition: "all 0.2s ease", textAlign: "left" };
const modelBtnStyle = { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", background: "transparent", border: "1px solid transparent", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease", width: "100%", textAlign: "left" };
const activeModelBtnStyle = { ...modelBtnStyle, background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)" };
const badgeStyle = { background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#d8b4fe', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', marginLeft: '12px' };