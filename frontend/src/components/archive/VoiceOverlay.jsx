function VoiceOverlay({ listening, onClose }){
  if(!listening) return null;
  const style = {
    overlay:{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(8,11,20,0.93)",backdropFilter:"blur(24px)"},
    content:{display:"flex",flexDirection:"column",alignItems:"center",gap:28,animation:"none"},
    orb:{width:80,height:80,borderRadius:"50%",background:"radial-gradient(circle at 38% 38%,rgba(124,58,237,0.4),rgba(6,182,212,0.1))",border:"1px solid rgba(124,58,237,0.4)",display:"flex",alignItems:"center",justifyContent:"center",color:"#9d5cf6",boxShadow:"0 0 40px rgba(124,58,237,0.25)"},
    label:{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.22em",color:"#9d5cf6",opacity:0.7,textTransform:"uppercase"},
    bars:{display:"flex",alignItems:"center",gap:3,height:28},
    cancel:{padding:"9px 26px",borderRadius:100,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#8892b0",fontFamily:"Inter,sans-serif",fontSize:13,cursor:"pointer"},
  };
  return (
    <div style={style.overlay}>
      <div style={style.content}>
        <div style={style.orb}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
        <div style={style.label}>Listening...</div>
        <button style={style.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
export default VoiceOverlay;
