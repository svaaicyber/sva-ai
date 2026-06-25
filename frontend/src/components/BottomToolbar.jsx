import "../styles/bottomToolbar.css";

export default function BottomToolbar(){

const tools=[

"⚡",
"💬",
"🐍",
"📄",
"☁️",
"📊",
"🎵"

]

return(

<div className="bottom-toolbar">


<div className="model-selector">

<div className="model-dot"></div>

<div>

<h4>GPT-4o</h4>

<p>Active Model</p>

</div>

</div>



<div className="quick-dock">

{tools.map((tool,index)=>(

<div
key={index}
className="dock-icon"
>

{tool}

</div>

))}

</div>



<div className="system-status">

<div className="status-pulse"></div>

<div>

<h4>
All Systems
</h4>

<p>
Operational
</p>

</div>

</div>

</div>

)

}