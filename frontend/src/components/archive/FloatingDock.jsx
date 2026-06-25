import "./FloatingDock.css";

const actions=[

{
icon:"💬",
name:"Chat"
},

{
icon:"💻",
name:"Code"
},

{
icon:"🔍",
name:"Research"
},

{
icon:"✨",
name:"Creative"
},

{
icon:"📎",
name:"Upload"
},

{
icon:"🎤",
name:"Voice"
}

];

export default function FloatingDock(){

return(

<div className="dock">

{

actions.map((a)=>(

<button

key={a.name}

className="dock-btn"

title={a.name}

>

<span>

{a.icon}

</span>

</button>

))

}

</div>

)

}