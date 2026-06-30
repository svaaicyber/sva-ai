import Sidebar from "../components/Sidebar";
import Insights from "../components/Insights";
import Hero from "../components/Hero";

import { useState, useEffect, useRef } from "react";

import FeatureCards from "../components/FeatureCards";
import Settings from "../components/Settings";
import CommandBar from "../components/CommandBar";
import Agents from "../components/Agents";
import Labs from "../components/Labs";
import Memory from "../components/Memory";
import Library from "../components/Library"

import "../styles/home.css";

// 🚨 YAHAN NAYA FUNCTION IMPORT KIYA HAI
import { sendMessage, uploadDocument, saveImageToHistory } from "../services/chatService";
import { getSession } from "../services/sessionService";
import { generateImage } from "../services/imageService";

export default function Home() {
  const [lastPrompt, setLastPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("home"); 
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(
    Date.now().toString(36) + Math.random().toString(36).substring(2)
  );
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("sva-core");
  const [selectedModel, setSelectedModel] = useState("SVA Flash");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userName, setUserName] = useState("");
  
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("sva_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const firstName = parsedUser.name ? parsedUser.name.split(" ")[0] : "Khushal";
        setUserName(firstName);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const stopGenerationRef = useRef(false);
  const recognitionRef = useRef(null);
  const isCallActiveRef = useRef(false);

  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = localStorage.getItem("sva_theme") || "neon-purple";
      document.body.className = currentTheme;
    };
    applyTheme();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => console.warn("Location denied")
      );
    }
  }, []);

  const speakText = (text, onEndCallback = null) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    let langCode = 'en-IN'; 
    if (/[\u0900-\u097F]/.test(text)) langCode = 'hi-IN'; 
    else if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) langCode = 'ja-JP'; 
    else if(/[äöüßÄÖÜ]/.test(text) && /ich|das|ist|nicht|und/.test(text.toLowerCase())) langCode = 'de-DE'; 
    else if(/[¿¡áéíóúñÁÉÍÓÚÑ]/.test(text) || /hola|que|este|como|los/.test(text.toLowerCase())) langCode = 'es-ES'; 
    else if(/[çéèêëàâùûüîïœæÇÉÈÊËÀÂÙÛÜÎÏŒÆ]/.test(text) || /bonjour|vous|avec|pour|dans/.test(text.toLowerCase())) langCode = 'fr-FR'; 

    utterance.lang = langCode;
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode)) || voices.find(v => v.lang.includes('IN'));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.rate = 1;
    
    utterance.onstart = () => {
      if (isCallActiveRef.current) setCallStatus("SVA is speaking...");
    };

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
      if (isCallActiveRef.current) {
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";

      rec.onstart = () => {
        if (isCallActiveRef.current) setCallStatus("Listening...");
      };

      rec.onresult = async (event) => {
        const speechToText = event.results[0][0].transcript;
        if (!speechToText.trim()) return;

        setCallStatus("Thinking...");
        setMessages(prev => [...prev, { role: "user", text: speechToText }]);

        try {
          const data = await sendMessage(speechToText, messages, sessionId, activeAgent, userLocation, selectedModel);
          const reply = data.reply;

          setMessages(prev => [...prev, { role: "ai", text: reply }]);
          setRefreshSidebar(prev => prev + 1);
          speakText(reply);
        } catch (err) {
          console.error(err);
          setCallStatus("Network Error");
          speakText("Connection error.");
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'no-speech' && isCallActiveRef.current) {
          try { rec.start(); } catch(e){}
        }
      };
      recognitionRef.current = rec;
    }
  }, [sessionId, activeAgent, userLocation, selectedModel, messages]); 

  const startVoiceCall = () => {
    setIsCalling(true);
    setChatStarted(true);
    isCallActiveRef.current = true;

    const welcome = "Hello. SVA Live Call active.";
    setMessages(prev => [...prev, { role: "ai", text: welcome }]);
    speakText(welcome);

    setTimeout(() => recognitionRef.current?.start(), 1200);
  };

  const endVoiceCall = () => {
    setIsCalling(false);
    isCallActiveRef.current = false;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
  };

  const handleDirectSend = async (textToSubmit, fileAttachment) => {
    stopGenerationRef.current = false;
    const text = textToSubmit || input;

    if (!text.trim() && !fileAttachment) return;

    setLastPrompt(text);
    setInput("");
    setChatStarted(true);

    setMessages(prev => [...prev, { role: "user", text: text || "Uploaded a file." }]);
    setLoading(true);

    try {
      let base64Image = null;
      if (fileAttachment && fileAttachment.type.startsWith("image/")) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(fileAttachment);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const textLower = text.toLowerCase();
      const hasAction = ["generate", "create", "make", "draw", "design"].some(word => textLower.includes(word));
      const hasMedium = ["image", "photo", "picture", "art"].some(word => textLower.includes(word));

      /* 🎨 IMAGE GENERATION - 🚨 DUAL SAVE YAHAN HAI */
      if (hasAction && hasMedium && !fileAttachment) {
        const result = await generateImage(text);
        if (result.success) {
          setMessages(prev => [...prev, { role: "ai", text: "Generated successfully.", image: result.imageUrl }]);
          
          // 1. Backend ko bhejo taaki DB mein hamesha ke liye save ho
          await saveImageToHistory(sessionId, text, result.imageUrl);
          
          // 2. Sidebar refresh karo
          setRefreshSidebar(prev => prev + 1);
        }
        setLoading(false);
        return;
      }

      /* 💬 NORMAL / VISION MESSAGE */
      const data = await sendMessage(text, messages, sessionId, activeAgent, userLocation, selectedModel, base64Image);
      const fullReply = data.reply;
      
      setMessages(prev => [...prev, { role: "ai", text: fullReply }]);
      setRefreshSidebar(prev => prev + 1);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", text: "Connection error." }]);
    }
    setLoading(false);
  };

  const handleRegenerate = async (index) => {
    if (messages.length === 0) return;

    let updatedHistory = [...messages];
    let userMessageText = lastPrompt;

    if (typeof index === 'number' && updatedHistory[index]?.role === "ai") {
      userMessageText = updatedHistory[index - 1].text;
      updatedHistory = updatedHistory.slice(0, index - 1);
    } else {
      if (updatedHistory[updatedHistory.length - 1]?.role === "ai") {
        updatedHistory.pop();
      }
      userMessageText = updatedHistory[updatedHistory.length - 1]?.text || lastPrompt;
      updatedHistory.pop(); 
    }

    setMessages(updatedHistory);
    await handleDirectSend(userMessageText, null);
  };

  const stopResponse = () => { stopGenerationRef.current = true; };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      handleDirectSend(`Analyze ${droppedFile.name}`, droppedFile);
    }
  };

  return (
    <div className="home">
      {isCalling && (
        <div className="sva-live-call-screen">
          <div className="call-header">
            <div className="live-badge"><span className="live-dot"></span> LIVE</div>
            <h2>SVA Voice</h2>
            <p>{callStatus}</p>
          </div>
          <div className="orb-container">
            <div className="orb-ripple ripple-1"></div>
            <div className="orb-ripple ripple-2"></div>
            <div className="orb-ripple ripple-3"></div>
            <div className="orb-core"></div>
          </div>
          <div className="call-controls">
            <button className="end-call-btn-large" onClick={endVoiceCall}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
                <line x1="23" y1="1" x2="1" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`sidebar-wrapper ${isMobileMenuOpen ? "open" : ""}`}>
        <Sidebar
          refreshTrigger={refreshSidebar}
          onNewChat={() => {
            setMessages([]);
            setChatStarted(false);
            setSessionId(Date.now().toString(36) + Math.random().toString(36).substring(2));
            setActiveTab("home");
            setActiveAgent("sva-core");
            setIsMobileMenuOpen(false);
          }}
          onSelectChat={async (id) => {
            const data = await getSession(id);
            if (data.success) {
              // 🚨 IMAGE LOAD HOGI RELOAD PE (Yahan 'image: c.image' daal diya hai)
              setMessages(data.chats.flatMap(c => [
                { role: "user", text: c.message }, 
                { role: "ai", text: c.reply, image: c.image || null }
              ]));
              setChatStarted(true);
              setSessionId(id);
              setIsMobileMenuOpen(false);
            }
          }}
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
        />
      </div>

      <main
        className="main-content"
        style={{ paddingTop: (isMobile && chatStarted) ? "90px" : "" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isMobile && (
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
        )}

        {isDragging && (
          <div className="drop-zone-overlay">
            <div className="drop-zone-content">
              <div className="drop-icon-pulse">📄</div>
              <h2>Drop document or image</h2>
            </div>
          </div>
        )}

        {activeTab === "insights" ? (
          <Insights />
        ) : ["account", "settings", "feedback", "help", "shortcuts"].includes(activeTab) ? (
          <Settings activeTab={activeTab} onClose={() => setActiveTab("home")} />
        ) : activeTab === "agents" ? (
          <Agents activeAgent={activeAgent} onSelectAgent={(agentId) => { setActiveAgent(agentId); setActiveTab("home"); }} />
        ) : activeTab === "memory" ? (
          <Memory />
        ) : activeTab === "labs" ? (
          <Labs />
        ) : activeTab === "library" ? (
          <Library />
        ) : (
          <>
            {!isMobile && !chatStarted && (
              <>
                <Hero />
                <FeatureCards onCardClick={(text) => handleDirectSend(text, null)} />
              </>
            )}

            {isMobile && !chatStarted && (
              <div className="mobile-drone-show">
                <div className="night-sky-parallax">
                  {[...Array(40)].map((_, i) => (
                    <div key={`star-${i}`} className="ambient-star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}></div>
                  ))}
                </div>
                <div className="drone-text-assembly">
                  <h1 className="particle-word hey-word">Hey,</h1>
                  <h1 className="particle-word name-word">{userName || userName }.</h1>
                  <p className="drone-subtext">How are you doing today?</p>
                </div>
              </div>
            )}

            <div className="mobile-dock-wrapper">
              <CommandBar
                activeAgent={activeAgent}
                selectedModel={selectedModel}
                onModelChange={(m) => setSelectedModel(m)}
                chatStarted={chatStarted}
                input={input}
                setInput={setInput}
                messages={messages}
                loading={loading}
                onSend={(text, file) => handleDirectSend(text, file)}
                onCallTrigger={startVoiceCall}
                onRegenerate={handleRegenerate}
                onStopResponse={stopResponse}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}