import React from 'react';
// Path goes up one level to 'src', then into 'styles'
import '../styles/hero.css'; 

const Hero = () => {
  return (
    <div className="hero">
      {/* SVA LOGO */}
      <h1 className="hero-logo">SVA</h1>
      
      {/* SUBTITLE */}
      <p className="hero-subtitle">SEARCH . THINK . KNOW.</p>
    </div>
  );
};

export default Hero;