import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, PlaySquare, X, Coins, Trophy } from 'lucide-react';
import '../styles/labs.css';

// 🚨 ALL 10 PREMIUM GAMES LIST
const SVA_GAMES = [
  { id: 'tictactoe', title: 'Pro Tic-Tac-Toe', desc: 'SVA AI Engine', icon: 'XO', color: '#f43f5e', path: '/games/tictactoe/index.html', coins: 50, status: 'play' },
  { id: 'memory', title: 'Cognitive Match', desc: 'Memory Analytics', icon: '🧠', color: '#10b981', path: '/games/memory/index.html', coins: 100, status: 'play' },
  { id: 'snake', title: 'Cyber Snake', desc: 'Reflex & Pathfinding', icon: '🐍', color: '#06b6d4', path: '/games/snake/index.html', coins: 75, status: 'play' },
  { id: 'pong', title: 'Neon Pong', desc: 'Defeat the SVA Paddle', icon: '🏓', color: '#a855f7', path: '/games/pong/index.html', coins: 60, status: 'play' },
  { id: 'math', title: 'Math Matrix', desc: 'Rapid Computation', icon: '➗', color: '#eab308', path: '/games/math/index.html', coins: 80, status: 'play' },
  { id: '2048', title: 'Quantum 2048', desc: 'Pattern Merging', icon: '🔢', color: '#f97316', path: '/games/2048/index.html', coins: 150, status: 'play' },
  { id: 'sudoku', title: 'Sudoku Core', desc: 'Logic Processing', icon: '▦', color: '#3b82f6', path: '/games/sudoku/index.html', coins: 200, status: 'play' },
  { id: 'minesweeper', title: 'Mine Sweeper', desc: 'Probability Engine', icon: '💣', color: '#ef4444', path: '/games/minesweeper/index.html', coins: 120, status: 'coming' },
  { id: 'bitshift', title: 'Bit Shift', desc: 'Binary Logic', icon: '<<', color: '#06b6d4', path: '/games/bitshift/index.html', coins: 100, status: 'play' },
  { id: 'circuit', title: 'Circuit Logic', desc: 'Hardware Engineering', icon: '⚡', color: '#f59e0b', path: '/games/circuit/index.html', coins: 150, status: 'play' },
  { id: 'hacker', title: 'Term-Hacker', desc: 'Command Line', icon: '💻', color: '#10b981', path: '/games/hacker/index.html', coins: 200, status: 'coming' },
  { id: 'flappy', title: 'Drone Glide', desc: 'Gravity Sandbox', icon: '🛸', color: '#8b5cf6', path: '/games/flappy/index.html', coins: 40, status: 'coming' },
  { id: 'typing', title: 'Typo Master', desc: 'Keyboard Analytics', icon: '⌨️', color: '#14b8a6', path: '/games/typing/index.html', coins: 90, status: 'coming' }
];

export default function Labs() {
  const [svaCoins, setSvaCoins] = useState(1240);
  const [playingGame, setPlayingGame] = useState(null); // Holds the local game path
  const [adPrompt, setAdPrompt] = useState(null); // Holds the reward amount when game ends

  // 🚨 THE COMMUNICATION BRIDGE (Listens to the Iframe)
  useEffect(() => {
    const handleGameMessage = (event) => {
      // Check if the message is from our game
      if (event.data && event.data.type === 'GAME_OVER') {
        console.log("Game Ended! Coins won:", event.data.coins);
        setAdPrompt(event.data.coins); // Show the Ad Modal with the coins won
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, []);

  const claimRewardAndWatchAd = () => {
    // 📺 This is where you would call Google AdMob / Rewarded Video API
    console.log("Playing Premium Ad...");
    
    // Simulate ad finishing after 2 seconds
    setTimeout(() => {
      setSvaCoins(prev => prev + adPrompt);
      setAdPrompt(null);
      setPlayingGame(null); // Close the game
    }, 2000);
  };

  const skipReward = () => {
    setAdPrompt(null);
    setPlayingGame(null);
  };

  return (
    <div className="sva-vault-wrapper">
      <AnimatePresence>
        
        {/* --- MAIN ARCADE MENU --- */}
        {!playingGame ? (
          <motion.div className="labs-ecosystem" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            <div className="labs-topbar">
              <div>
                <h1 className="labs-title">SVA Arcade</h1>
                <p className="labs-subtitle">Premium Local Engine</p>
              </div>
              <div className="coin-balance">
                <Coins size={18} color="#eab308" />
                <span>{svaCoins}</span>
              </div>
            </div>

            <div className="api-games-grid">
              {SVA_GAMES.map((game) => (
                <div 
                  key={game.id} 
                  className="api-game-card" 
                  onClick={() => game.status !== 'coming' && setPlayingGame(game.path)}
                  style={{ opacity: game.status === 'coming' ? 0.6 : 1, cursor: game.status === 'coming' ? 'not-allowed' : 'pointer' }}
                >
                  <div className="api-game-thumb" style={{ background: '#121212', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <h1 style={{color: game.color, fontSize: '48px', textShadow: `0 0 15px ${game.color}80`, margin: 0}}>
                      {game.icon}
                    </h1>
                  </div>
                  <div className="api-game-info">
                    <h3>{game.title}</h3>
                    <p>{game.desc}</p>
                    <div className="api-game-tags">
                      {game.status === 'coming' ? (
                        <span className="reward-badge" style={{color: '#a1a1aa', background: 'rgba(255,255,255,0.1)'}}>Coming Soon</span>
                      ) : (
                        <span className="reward-badge"><Trophy size={10}/> Up to {game.coins} Coins</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        ) : (

          /* --- THE GAME MODAL --- */
          <motion.div className="fullscreen-game-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <div className="gameplay-header">
              <div className="playing-title"><Gamepad2 size={18} color="#06b6d4" /> Playing Local Engine</div>
              <button className="exit-game-btn" onClick={skipReward}><X size={18} /> Exit</button>
            </div>
            
            {/* 🎮 LOADING THE LOCAL GAME WITHOUT CORS ISSUES */}
            <div className="iframe-wrapper">
              <iframe src={playingGame} frameBorder="0" scrolling="no" style={{width: '100%', height: '100%'}}></iframe>
            </div>

            {/* 🚨 PREMIUM AD MODAL (Triggered by postMessage) */}
            {adPrompt !== null && (
              <div className="snake-overlay">
                <div className="ad-prompt-box" style={{ textAlign: 'center' }}>
                  <h2 style={{color: '#10b981', margin: '0 0 10px 0'}}>Game Finished!</h2>
                  <p style={{marginBottom: '20px', color: '#a1a1aa'}}>You earned <strong>{adPrompt} SVA Coins</strong>.</p>
                  
                  <button className="watch-ad-btn" onClick={claimRewardAndWatchAd}>
                    <PlaySquare size={16} /> Watch Ad to Claim Coins
                  </button>
                  <button className="restart-btn" style={{marginTop: '10px'}} onClick={skipReward}>
                    Skip & Lose Coins
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}