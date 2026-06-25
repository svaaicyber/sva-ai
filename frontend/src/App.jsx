// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; 
import Home from './pages/Home';
import Auth from './pages/Auth'; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 🚨 BOUNCER LOGIC: Check karo ki kya user ne onboarding complete kar li hai?
      const isOnboardingDone = localStorage.getItem("sva_onboarding_done") === "true";

      if (user && isOnboardingDone) {
        // Agar logged in hai aur onboarding bhi done hai, tabhi Home pe bhejo
        setIsAuthenticated(true);
      } else {
        // Warna usko Auth page par hi roko
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚨 JAB USER ONBOARDING (PERSONALIZATION) COMPLETE KAREGA TAB YEH CALL HOGA
  const handleLoginSuccess = () => {
    localStorage.setItem("sva_onboarding_done", "true"); // Bouncer ko bol do ki allow kare
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      localStorage.removeItem("sva_token"); 
      localStorage.removeItem("sva_user");
      localStorage.removeItem("sva_onboarding_done"); // Reset karo taaki naye user ko onboarding dikhe
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508', color: '#a1a1aa', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Initializing SVA</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased selection:bg-cyan-500/30">
      {isAuthenticated ? (
        <Home onLogout={handleLogout} /> 
      ) : (
        // 🚨 Yahan onLoginSuccess mein apna naya function pass kar diya
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}