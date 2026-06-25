function LiveCall({ liveMode, toggleLive }){
  if(!liveMode) return null;
  const s = {
    overlay:{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(8,11,20,0.96)",backdropFilter:"blur(30px)"},
    content:{display:"flex",flexDirection:"column",alignItems:"center",gap:24},
    tag:{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.2em",color:"#10b981",display:"flex",alignItems:"center",gap:7,opacity:0.8},
    dot:{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px #10b981"},
    avatar:{width:90,height:90,borderRadius:"50%",background:"radial-gradient(circle at 35%,rgba(124,58,237,0.35),rgba(6,182,212,0.1))",border:"1px solid rgba(124,58,237,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",fontSize:28,fontWeight:700,color:"#9d5cf6"},
    name:{fontSize:22,fontWeight:600,color:"#e2e8f8"},
    end:{padding:"12px 36px",borderRadius:100,border:"1px solid rgba(232,121,249,0.3)",background:"rgba(232,121,249,0.08)",color:"#e879f9",fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:500,cursor:"pointer",marginTop:8},
  };
  return (
    <div style={s.overlay}>
      <div style={s.content}>
        <div style={s.tag}><span style={s.dot}/>Live Session</div>
        <div style={s.avatar}>SVA</div>
        <div style={s.name}>SVA Assistant</div>
        <button style={s.end} onClick={toggleLive}>End Call</button>
      </div>
    </div>
  );
}
export default LiveCall;
