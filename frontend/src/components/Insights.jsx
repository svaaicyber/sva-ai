import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion"; 
import { Sparkles, BrainCircuit, Activity, Zap, Clock, Terminal, Flame, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/insights.css";

/* ================= FRAMER ================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// 🗓️ 1. HELPER: Generate perfect 7-day timeline ending on TODAY
const generateLast7Days = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Local time string YYYY-MM-DD nikalna
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    result.push({
      fullDate: `${year}-${month}-${day}`, 
      day: i === 0 ? 'Today' : days[d.getDay()], // Aaj ke din ko "Today" dikhayega
      prompts: 0 
    });
  }
  return result;
};

// 👑 2. HELPER: The Personalized Title Engine
const getPersonalizedTitle = (prompts, docs, waves) => {
  if (prompts === 0) return "Sleeping Node";
  if (waves > docs && waves > 2) return "Quantum Architect ⚡";
  if (docs > waves && docs > 2) return "Master Scribe 📝";
  if (prompts > 100) return "Omni Overlord 👑";
  if (prompts > 50) return "Deep Flow Coder 💻";
  if (prompts > 15) return "Avid Explorer 🚀";
  return "Curious Mind 🌱";
};

export default function Insights() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FRAMER MOTION CUSTOM COUNTER
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // 🚨 1. DEV BYPASS: Agar token nahi mila toh fake token de do
        let token = localStorage.getItem("sva_token");
        
        if (!token) {
          console.warn("SVA Token missing! Using Dev Bypass.");
          token = "temp_dev_token"; // Frontend ko block hone se rokne ke liye
        }

        console.log("🔥 TARGET LOCKED - Fetching permanent analytics via Secure Token");

        const CURRENT_IP = window.location.hostname;
        
        const res = await fetch(`http://${CURRENT_IP}:5000/api/analytics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        }); 
        
        const data = await res.json();
        
        if (data.success) {
          // ✅ Backend ne real data bhej diya
          const baseTimeline = generateLast7Days();
          
          if (data.data.chartData && data.data.chartData.length > 0) {
            data.data.chartData.forEach(backendItem => {
              const matchIndex = baseTimeline.findIndex(b => b.fullDate === backendItem.date);
              if (matchIndex !== -1) {
                baseTimeline[matchIndex].prompts = backendItem.prompts;
              }
            });
          }

          const score = (data.data.totalInteractions * 10) + 
                        (data.data.documentsCreated * 50) + 
                        (data.data.waveformsGenerated * 100);

          setLiveData({
            ...data.data,
            chartData: baseTimeline,
            universeScore: score > 0 ? score : 0,
            customTitle: getPersonalizedTitle(data.data.totalInteractions, data.data.documentsCreated, data.data.waveformsGenerated)
          });

          animate(count, score > 0 ? score : 0, { duration: 2.5 });
        } else {
          throw new Error("Backend response not successful");
        }
      } catch (error) {
        // 🚨 2. FALLBACK INJECTION: Agar backend fail hua toh Dummy Data dikhao 0 nahi!
        console.error("Backend fetch failed, injecting Dummy Data for UI testing:", error);
        
        const dummyScore = 8450;
        setLiveData({
          totalInteractions: 142,
          totalWordsGenerated: 15420,
          documentsCreated: 12,
          waveformsGenerated: 28,
          chartData: generateLast7Days().map(d => ({ ...d, prompts: Math.floor(Math.random() * 25) + 5 })),
          universeScore: dummyScore,
          customTitle: getPersonalizedTitle(142, 12, 28)
        });

        animate(count, dummyScore, { duration: 2.5 });
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [count]);

  const chartData = liveData?.chartData || generateLast7Days();

  return (
    <motion.div
      className="ins-wrapper ins-neural-bg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="ins-orb ins-orb-1"></div>
      <div className="ins-orb ins-orb-2"></div>

      <div className="ins-container">

        <motion.div className="ins-header" variants={itemVariants}>
          <h1 className="ins-title">Universe Analytics</h1>
          <p className="ins-subtitle">Your digital footprint, decoded and visualized in real-time.</p>
        </motion.div>

        {loading ? (
          <div style={{ color: "#06b6d4", textAlign: "center", marginTop: "100px", fontFamily: "monospace", fontSize: "16px" }}>
            <span className="ins-loader-icon" style={{ display: 'inline-block', animation: 'spinGlow 2s linear infinite' }}>⚡</span> Decrypting Live Database Streams...
          </div>
        ) : (
          <>
            <motion.div className="ins-panel ins-hero-panel" variants={itemVariants}>
              <div className="ins-score-section">
                <h4 className="ins-label">UNIVERSE SCORE</h4>
                
                <div className="ins-score-display">
                  <motion.h1 className="ins-massive-score">
                    {rounded}
                  </motion.h1>
                  
                  {/* 🚨 DYNAMIC PERSONALIZED BADGE HERE */}
                  <div className="ins-score-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#e9d5ff' }}>
                    {liveData?.customTitle || "Initiate"}
                  </div>
                </div>

                <div className="ins-mood-detector">
                  <Flame size={16} className="ins-pink-text" />
                  <span>
                    Status: 
                    <strong> {liveData?.totalInteractions > 50 ? "Deep Flow State" : "Active & Learning"}</strong>
                  </span>
                </div>
              </div>

              <div className="ins-ai-text-section">
                <div className="ins-panel-header">
                  <Sparkles className="ins-purple-text" size={20} />
                  <h2>SVA's Live Analysis</h2>
                </div>
                <p className="ins-ai-insight">
                  SVA has processed <strong>{liveData?.totalInteractions} neural inputs</strong> and generated <strong>{liveData?.totalWordsGenerated} words</strong>. 
                  Based on your usage, you've earned the title of <strong>{liveData?.customTitle}</strong>.
                </p>
                <p className="ins-ai-insight-sub">
                  ⚡ <strong>{liveData?.documentsCreated} Documents</strong> & <strong>{liveData?.waveformsGenerated} Interactive Waves</strong> constructed successfully.
                </p>
              </div>
            </motion.div>

            <motion.div className="ins-grid-4" variants={itemVariants}>
              <div className="ins-mini-card">
                <Terminal size={18} className="ins-cyan-text" />
                <span>TOTAL PROMPTS</span>
                <h3>{liveData?.totalInteractions || 0}</h3>
              </div>
              <div className="ins-mini-card">
                <BrainCircuit size={18} className="ins-purple-text" />
                <span>WORDS SYNTHESIZED</span>
                <h3>{liveData?.totalWordsGenerated || 0}</h3>
              </div>
              <div className="ins-mini-card">
                <Clock size={18} className="ins-pink-text" />
                <span>DOCS RENDERED</span>
                <h3>{liveData?.documentsCreated || 0} Drafts</h3>
              </div>
              <div className="ins-mini-card">
                <Activity size={18} className="ins-cyan-text" />
                <span>WAVES GENERATED</span>
                <h3>{liveData?.waveformsGenerated || 0} Signals</h3>
              </div>
            </motion.div>

            <motion.div className="ins-panel" variants={itemVariants}>
              <div className="ins-panel-header">
                <Zap className="ins-purple-text" size={20} />
                <h2>Cognitive Distribution</h2>
              </div>
              
              <div className="ins-circular-grid">
                <div className="ins-circle-wrapper">
                  <CircularProgressbar value={92} text={`92%`} styles={buildStyles({ pathColor: "#a855f7", textColor: "#fff", trailColor: "rgba(255,255,255,0.05)" })} />
                  <h4>Curiosity</h4>
                </div>
                <div className="ins-circle-wrapper">
                  <CircularProgressbar value={88} text={`88%`} styles={buildStyles({ pathColor: "#06b6d4", textColor: "#fff", trailColor: "rgba(255,255,255,0.05)" })} />
                  <h4>Logic & Code</h4>
                </div>
                <div className="ins-circle-wrapper">
                  <CircularProgressbar value={95} text={`95%`} styles={buildStyles({ pathColor: "#ff499e", textColor: "#fff", trailColor: "rgba(255,255,255,0.05)" })} />
                  <h4>Research Depth</h4>
                </div>
                <div className="ins-circle-wrapper">
                  <CircularProgressbar value={74} text={`74%`} styles={buildStyles({ pathColor: "#3b82f6", textColor: "#fff", trailColor: "rgba(255,255,255,0.05)" })} />
                  <h4>Creativity</h4>
                </div>
              </div>
            </motion.div>

            {/* 🚨 THE FIXED GRAPH */}
            <motion.div className="ins-panel" variants={itemVariants}>
              <div className="ins-panel-header">
                <TrendingUp className="ins-cyan-text" size={20} />
                <h2>Thought Momentum (Last 7 Days)</h2>
              </div>
              
              <div className="ins-chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,20,0.95)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "14px", color: "#fff"
                      }}
                    />
                    <Area type="monotone" dataKey="prompts" stroke="#06b6d4" fill="url(#cyanGlow)" strokeWidth={5} dot={true} activeDot={{ r: 8, fill: '#06b6d4' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
        <div className="ins-spacer"></div>
      </div>
    </motion.div>
  );
}