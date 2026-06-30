import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Code, BookOpen, Zap, Eye, EyeOff } from 'lucide-react';

// 🚨 FIREBASE IMPORTS
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider, 
  getAuth,
  GithubAuthProvider 
} from 'firebase/auth';

import '../styles/auth.css';

// ── Drone Show Particle Engine ──
function DroneShow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationFrameId;

    const numParticles = 1000;
    const particles = [];
    const colors = ['#FFFFFF', '#06b6d4', '#7c3aed'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        targetX: 0, targetY: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const getTextCoords = (text, fontSize) => {
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      offCanvas.width = width; offCanvas.height = height;
      offCtx.fillStyle = 'white';
      offCtx.font = `900 ${fontSize}px Inter, sans-serif`;
      offCtx.textAlign = 'center'; 
      offCtx.textBaseline = 'middle';

      const yPosition = width < 768 ? height * 0.18 : height / 2.5; 
      offCtx.fillText(text, width / 2, yPosition);

      const data = offCtx.getImageData(0, 0, width, height).data;
      const coords = [];
      const step = width < 768 ? 4 : 7;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 128) coords.push({ x, y });
        }
      }
      return coords;
    };

    let targetsWelcome = [];
    let targetsSVA = [];

    const calculateTargets = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const welcomeText = width < 768 ? "Welcome" : "Welcome to";
      targetsWelcome = getTextCoords(welcomeText, width < 768 ? 45 : 80);
      targetsSVA = getTextCoords("SVA", width < 768 ? 70 : 160);
    };

    calculateTargets();
    window.addEventListener('resize', calculateTargets);

    let state = 'scatter';
    let timer = 0;

    const draw = () => {
      timer++;
      if (timer === 1) state = 'scatter';
      else if (timer === 150) { 
        state = 'welcome';
        particles.forEach((p, i) => { if (targetsWelcome[i % targetsWelcome.length]) { p.targetX = targetsWelcome[i % targetsWelcome.length].x; p.targetY = targetsWelcome[i % targetsWelcome.length].y; }});
      }
      else if (timer === 450) state = 'scatter';
      else if (timer === 600) { 
        state = 'sva';
        particles.forEach((p, i) => { if (targetsSVA[i % targetsSVA.length]) { p.targetX = targetsSVA[i % targetsSVA.length].x; p.targetY = targetsSVA[i % targetsSVA.length].y; }});
      }
      else if (timer === 950) timer = 0;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        if (state === 'scatter') {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        } else {
          p.x += (p.targetX - p.x) * 0.08 + (Math.random() - 0.5) * 0.5;
          p.y += (p.targetY - p.y) * 0.08 + (Math.random() - 0.5) * 0.5;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('resize', calculateTargets); cancelAnimationFrame(animationFrameId); };
  }, []);

  return <canvas ref={canvasRef} className="drone-show-canvas" />;
}

// ── Password Strength & Progress Dots ──
function Progress({ step }) {
  const steps = ['login', 'register', 'onboarding'];
  const current = steps.indexOf(step);
  if (step === 'login' || step === 'forgot') return null;
  return (
    <div className="auth-progress">
      {['Account', 'Setup'].map((_, i) => (
        <div key={i} className={`prog-dot ${i < current ? 'done' : i === current ? 'active' : 'todo'}`} />
      ))}
    </div>
  );
}

// 🚨 MAIN AUTH COMPONENT
export default function Auth({ onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login', 'register', 'forgot', 'onboarding'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // 1️⃣ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("sva_token", token);
      setName(result.user.displayName || 'User'); 
      setStep('onboarding'); 
    } catch (err) { 
      setError(err.message); 
    }
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    try {
      const auth = getAuth();
      const provider = new GithubAuthProvider();
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const token = await user.getIdToken();
      localStorage.setItem("sva_token", token);
      
      // User data save kar rahe hain local storage mein
      localStorage.setItem("sva_user", JSON.stringify({ 
        name: user.displayName || user.reloadUserInfo?.screenName || "GitHub User", 
        email: user.email || "" 
      }));

      // 🚨 Agar login success ho gaya toh parent component ko batao
      setStep(2);
      console.log("GitHub Login Success:", user);

    } catch (error) { // 🚨 YEH CATCH BLOCK TERA MISSING THA
      console.error("GitHub Login Error:", error);
      alert(error.message);
    } // 🚨 YEH BRACKET TRY/CATCH KO BAND KARTA HAI
  }; // 🚨 YEH BRACKET FUNCTION KO BAND KARTA HAI

  // 3️⃣ EMAIL/PASSWORD & FORGOT PASSWORD FLOW
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);
    try {
      if (step === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // 🚨 FIX: Token save karo
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("sva_token", token);
        
        onLoginSuccess(); 
      } else if (step === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 🚨 FIX: Token save karo
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("sva_token", token);
        
        setStep('onboarding'); 
      } else if (step === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMsg('Password reset link sent to your email!');
        setTimeout(() => setStep('login'), 3000); 
      }
    } catch (err) { 
      if (err.code === 'auth/invalid-credential') setError('Invalid Email or Password.');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered.');
      else setError(`Error: ${err.message}`); 
    }
    setLoading(false);
  };


  // 🚀 CUSTOM NAME UPDATE & ENTER SVA
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      if (auth.currentUser && name.trim() !== "") {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      onLoginSuccess();
    } catch (err) {
      console.error("Name update error:", err);
      onLoginSuccess(); 
    }
  };

  const stepLabel = { login: 'System Access', register: 'Create account', forgot: 'Reset Password', onboarding: 'Personalize' };
  const stepSub   = { login: 'Sign in to your intelligence layer.', register: 'Join SVA — your cognitive companion.', forgot: 'Enter your email to receive a reset link.', onboarding: '' };

  const fadeBlurIn = {
    hidden: { opacity: 0, y: 30, filter: 'blur(15px)', scale: 0.95 },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };

  return (
    <div className="auth-master-container">

      <div className="auth-canvas">
        <div className="aurora-a"/><div className="aurora-b"/><div className="aurora-c"/>
        <DroneShow />
      </div>

      <div className="auth-branding-panel">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeBlurIn} className="brand-sva-text">SVA</motion.div>
          <motion.div variants={fadeBlurIn} className="brand-tagline">Search · Think · Know</motion.div>
          <motion.p variants={fadeBlurIn} className="brand-desc">
            Your personal <strong>intelligence layer</strong>. Built to think, learn, and grow alongside you.
          </motion.p>
          <motion.div variants={fadeBlurIn} className="brand-pills">
            {['Real-time Intelligence', 'Voice & Live Mode', 'Deep Memory', 'Always On'].map(label => (
              <div key={label} className="brand-pill"><div className="brand-pill-dot"/>{label}</div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="auth-action-panel">
        <AnimatePresence mode="wait">
          <motion.div
            className="auth-card" key={step}
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 'onboarding' ? (
              <div className="onboarding-container">
                <div className="onboarding-welcome">Account setup</div>
                
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>What should I call you?</h2>
                
                <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                  <User className="input-icon" size={18}/>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name or alias" 
                    required 
                    autoFocus
                  />
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '24px' }}>
                  How will you use SVA? This helps us tailor your experience.
                </p>
                <div className="role-grid">
                  {[
                    { id:'developer', Icon:Code, title:'Development', sub:'Coding & APIs'},
                    { id:'researcher',Icon:BookOpen, title:'Research', sub:'Analysis & study'},
                    { id:'explorer', Icon:Zap, title:'General Use', sub:'Daily tasks'},
                  ].map(({id,Icon,title,sub})=>(
                    <div key={id} className={`role-card ${selectedRole===id?'active':''}`} onClick={()=>setSelectedRole(id)}>
                      <div className="role-icon"><Icon size={20}/></div>
                      <div className="role-info"><h3>{title}</h3><span>{sub}</span></div>
                      <div className="role-check">
                        {selectedRole===id && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="auth-submit-btn finish-btn" 
                  disabled={!selectedRole || name.trim() === ""} 
                  onClick={completeOnboarding}
                >
                  {loading ? <div className="auth-spinner"/> : <>Enter SVA <ArrowRight size={16}/></>}
                </button>
              </div>
            ) : (
              <>
                <Progress step={step}/>
                {step !== 'forgot' && <div className="auth-step-label">{step === 'login' ? 'System Access' : 'Step 1 of 2'}</div>}
                
                <div className="auth-header">
                  <h2>{stepLabel[step]}</h2>
                  <p>{stepSub[step]}</p>
                </div>
                
                {error && <div className="auth-error">{error}</div>}
                {msg && <div className="auth-error" style={{background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)'}}>{msg}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                  <AnimatePresence mode="wait">
                    <motion.div key="fields" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}} style={{display:'flex',flexDirection:'column',gap:12}}>
                      
                      {step === 'register' && (
                        <div className="auth-input-group">
                          <User className="input-icon" size={18}/>
                          <input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required autoFocus/>
                        </div>
                      )}
                      
                      <div className="auth-input-group">
                        <Mail className="input-icon" size={18}/>
                        <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus={step==='login' || step==='forgot'}/>
                      </div>
                      
                      {step !== 'forgot' && (
                        <>
                          <div className="auth-input-group">
                            <Lock className="input-icon" size={18}/>
                            <input type={showPassword?'text':'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
                            <button type="button" onClick={()=>setShowPassword(p=>!p)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:0,display:'flex'}}>
                              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                          </div>
                          
                          {/* FORGOT PASSWORD LINK */}
                          {step === 'login' && (
                            <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '4px' }}>
                              <span className="auth-link" style={{ fontSize: '12px' }} onClick={() => { setError(''); setStep('forgot'); }}>
                                Forgot password?
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <div className="auth-spinner"/> : <>{step === 'forgot' ? 'Send Reset Link' : 'Continue'} <ArrowRight size={16}/></>}
                  </button>
                </form>

                {step !== 'forgot' && (
                  <>
                    <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
                    <div className="oauth-grid">
                      {/* GOOGLE BTN */}
                      <button type="button" className="oauth-btn" title="Google" onClick={handleGoogleLogin}>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </button>
                      
                      {/* GITHUB BTN */}
                      <button type="button" className="oauth-btn" title="GitHub" onClick={handleGithubLogin}>
                        <svg viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      </button>
                    </div>
                  </>
                )}

                <div className="auth-footer">
                  {step === 'forgot' ? (
                    <span className="auth-link" style={{marginLeft: 0}} onClick={() => {setError(''); setMsg(''); setStep('login')}}>← Back to login</span>
                  ) : (
                    <>
                      <span>{step==='login'?"Don't have an account?":"Already have an account?"}</span>
                      <span className="auth-link" onClick={()=>{setError('');setStep(step==='login'?'register':'login')}}>
                        {step==='login'?'Sign up':'Log in'}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}