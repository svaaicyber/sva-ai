import "./ChatBox.css";

export default function ChatBox(){

return(

<div className="chat-box">

<input
type="text"
placeholder="How can SVA help you today? | Type or Ask anything..."
className="chat-input"
/>

<div className="chat-tools">

<button className="tool active">
💬 Chat
</button>

<button className="tool">
💻 Code
</button>

<button className="tool">
🔍 Research
</button>

<button className="tool">
✨ Visualize
</button>

<button className="tool">
🎨 Creative
</button>

</div>

<button className="send-btn">
➤
</button>

</div>

)

}