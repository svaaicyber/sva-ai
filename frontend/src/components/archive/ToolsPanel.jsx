import "./ToolsPanel.css";

const tools=[

{
icon:"🌐",
title:"Web Search",
desc:"Real-time information"
},

{
icon:"💻",
title:"Code Assistant",
desc:"Generate code"
},

{
icon:"🧠",
title:"Memory",
desc:"Remember context"
},

{
icon:"🎨",
title:"Creative",
desc:"Ideas and content"
},

{
icon:"📊",
title:"Visualize",
desc:"Charts and diagrams"
},

{
icon:"🎤",
title:"Voice",
desc:"Talk naturally"
}

];

export default function ToolsPanel(){

return(

<div className="tools-panel">

<div className="tools-header">

AI Tools

</div>

{

tools.map((tool)=>(

<div
key={tool.title}
className="tool-card"
>

<div className="tool-icon">

{tool.icon}

</div>

<div>

<div className="tool-title">

{tool.title}

</div>

<div className="tool-desc">

{tool.desc}

</div>

</div>

</div>

))

}

</div>

)

}