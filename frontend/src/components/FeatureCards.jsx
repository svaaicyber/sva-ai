import "../styles/featureCards.css";

const cards = [
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, 
    title: "Talk to SVA", 
    desc: "Ask anything", 
    prompt: "Hello SVA, can you help me with a general question?" 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, 
    title: "Analyze document", 
    desc: "Upload & analyze", 
    prompt: "I need to analyze a document for key insights." 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.6c-.1.4 0 .9.4 1.1l7.3 4.2-2.8 2.8-3.4-.6c-.5-.1-.9.2-1.1.6l-1 2.3c-.2.4 0 .8.4 1l4.5 2.1 2.1 4.5c.2.4.6.6 1 .4l2.3-1c.4-.2.7-.6.6-1.1l-.6-3.4 2.8-2.8 4.2 7.3c.2.4.7.5 1.1.4l3.6-1.2c.5-.2.8-.6.7-1.1z"></path></svg>, 
    title: "Plan my trip", 
    desc: "AI itinerary", 
    prompt: "Plan a trip for me" 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, 
    title: "Debug Python", 
    desc: "Code helper", 
    prompt: "Help me debug my Python code" 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>, 
    title: "Write summary", 
    desc: "Smart summary", 
    prompt: "Write a legal summary" 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>, 
    title: "Music playlist", 
    desc: "AI curated", 
    prompt: "Create a music playlist" 
  },
  { 
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>, 
    title: "Stock market", 
    desc: "Live data", 
    prompt: "Analyze the stock market today" 
  }
];

export default function FeatureCards({ onCardClick }) {
  return (
    <div className="feature-cards">
      {cards.map((card, index) => (
        <div
          key={index}
          className="feature-card"
          onClick={() => onCardClick(card.prompt)}
        >
          <div className="feature-icon">{card.icon}</div>
          <div className="feature-text">
             <h3>{card.title}</h3>
             <p>{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}