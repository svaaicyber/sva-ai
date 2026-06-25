import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Volume2, Share2, RotateCcw, Pencil, Flag, FileText, Download, Loader2 } from 'lucide-react';
import '../styles/chatMessage.css'; 

// 🧩 1. PREMIUM CODE BLOCK WIDGET
const CodeBlock = ({ language, codeString }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sva-code-container">
      <div className="sva-code-header">
        <span className="sva-code-lang">{language || 'text'}</span>
        <button className="sva-code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter 
        style={vscDarkPlus} 
        language={language} 
        PreTag="div" 
        className="sva-code-body"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

// 📄 2. PREMIUM FILE CARD WIDGET (With Generating Animation)
const ArtifactWidget = ({ content, filename }) => {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // 🚨 New Animation States
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  // Magic Loading Effect
  useEffect(() => {
    // Progress bar ko dheere-dheere bharne ka logic
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random jump between 5% and 20%
        return Math.min(oldProgress + Math.random() * 15 + 5, 100);
      });
    }, 300); // Har 300ms mein update

    // 2.5 seconds ke baad file ready declare kar do
    const timeout = setTimeout(() => {
      setIsGenerating(false);
      clearInterval(interval);
    }, 2500);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const sizeInKB = (new Blob([content]).size / 1024).toFixed(1);

  const exportDocument = (format) => {
    let blob;
    let finalFilename = filename.includes('.') ? filename.split('.').slice(0, -1).join('.') : filename;

    if (format === 'txt') {
      blob = new Blob([content], { type: 'text/plain' });
      finalFilename += '.txt';
    } else if (format === 'md') {
      blob = new Blob([content], { type: 'text/markdown' });
      finalFilename += '.md';
    } else if (format === 'doc') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>${finalFilename}</title></head>
          <body style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6;">
            <div style="white-space: pre-wrap;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </body>
        </html>
      `;
      blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      finalFilename += '.doc';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🔄 THE GENERATING UI
  if (isGenerating) {
    return (
      <div className="sva-file-card generating">
        <div className="sva-file-left">
          <div className="sva-file-icon-box" style={{ background: 'transparent' }}>
            <Loader2 size={24} className="sva-loading-icon" />
          </div>
          <div className="sva-file-info">
            <span className="sva-file-name" style={{ color: '#fff' }}>Drafting {filename}</span>
            <div className="generating-text">Generating document...</div>
            <div className="sva-progress-container">
              <div className="sva-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ THE COMPLETED FILE CARD UI
  return (
    <div className="sva-file-card">
      <div className="sva-file-left">
        <div className="sva-file-icon-box">
          <FileText size={20} />
        </div>
        <div className="sva-file-info">
          <span className="sva-file-name">{filename}</span>
          <span className="sva-file-meta">SVA Artifact • {sizeInKB} KB</span>
        </div>
      </div>
      
      <div className="sva-file-actions">
        <button className="sva-artifact-btn" onClick={handleCopy} title="Copy Content">
          {copied ? <Check color="#22c55e" size={16} /> : <Copy size={16} />}
        </button>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="sva-artifact-btn" 
            onClick={(e) => { e.stopPropagation(); setShowExport(!showExport); }} 
            title="Download File"
          >
            <Download size={16} />
          </button>
          
          {showExport && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              background: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', overflow: 'hidden', zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: '160px',
              textAlign: 'left'
            }}>
              <div onClick={(e) => { e.stopPropagation(); exportDocument('doc'); }} style={{ padding: '12px 16px', fontSize: '13px', color: '#e4e4e7', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>📄 Word (.doc)</div>
              <div onClick={(e) => { e.stopPropagation(); exportDocument('txt'); }} style={{ padding: '12px 16px', fontSize: '13px', color: '#e4e4e7', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>📝 Plain Text (.txt)</div>
              <div onClick={(e) => { e.stopPropagation(); exportDocument('md'); }} style={{ padding: '12px 16px', fontSize: '13px', color: '#e4e4e7', cursor: 'pointer' }}>📜 Markdown (.md)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🤖 3. MAIN CHAT COMPONENT
export default function ChatMessage({ message, onRegenerate, setInput }) {
  const isAI = message.role === "ai" || message.sender === "sva";
  const content = message.text || message.reply;

  return (
    <div className={`sva-message-wrapper ${isAI ? 'ai' : 'user'}`}>
      {isAI ? (
        <div className="sva-ai-layout">
          
          <div className="sva-message-header">
            <span className="sva-dot">◉</span> SVA <span className="sva-time">just now</span>
          </div>
          
          <div className="sva-markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // ReactMarkdown ke andar ka components={{ code: ... }}
code({ node, inline, className, children, ...props }) {
  // Regex to match "language-artifact:Filename.md" or just "language-artifact"
  const match = /language-artifact(?:[:|](.+))?/.exec(className || '');
  const regularCodeMatch = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  
  // Agar 'artifact' tag mila
  if (!inline && match) {
    // Agar filename diya hai toh wo lo, warna default "Document"
    const filename = match[1] ? match[1].trim() : "Generated_Document";
    return <ArtifactWidget content={codeString} filename={filename} />; 
  }
  
  // Normal Code block (javascript, python, etc.)
  if (!inline && regularCodeMatch) {
    return <CodeBlock language={regularCodeMatch[1]} codeString={codeString} />; 
  }
  return <code className="sva-inline-code" {...props}>{children}</code>;
},
                table({ children }) {
                  return (
                    <div className="sva-table-wrapper">
                      <table>{children}</table>
                    </div>
                  );
                },
                a({ href, children }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;
                }
              }}
            >
              {content}
            </ReactMarkdown>

            {message.image && (
              <img src={message.image} alt="Generated content" className="sva-chat-image" />
            )}
          </div>

          <div className="sva-message-actions">
            <button className="sva-action-btn" onClick={() => navigator.clipboard.writeText(content)} title="Copy"><Copy size={16} /></button>
            <button className="sva-action-btn" onClick={() => { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(content)); }} title="Read Aloud"><Volume2 size={16} /></button>
            <button className="sva-action-btn" onClick={() => navigator.share?.({ text: content })} title="Share"><Share2 size={16} /></button>
            <button className="sva-action-btn" onClick={onRegenerate} title="Regenerate"><RotateCcw size={16} /></button>
            <button className="sva-action-btn" onClick={() => alert("Content flagged! Our Trust & Safety team will review this within 24 hours.")} title="Report Content"><Flag size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="sva-user-layout">
          <div className="sva-user-bubble">
            {content}
          </div>
          <div className="sva-message-actions user-actions">
            <button className="sva-action-btn" onClick={() => setInput && setInput(content)} title="Edit"><Pencil size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}