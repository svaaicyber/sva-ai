import { useEffect } from "react";
import "./CommandPalette.css";

const commands=[

"New Chat",
"Code Mode",
"Research Mode",
"Creative Mode",
"Voice Mode",
"Clear Chat"

];

export default function CommandPalette({

open,
setOpen

}){

useEffect(()=>{

const handler=(e)=>{

if(
e.ctrlKey &&
e.key==="k"
){

e.preventDefault();

setOpen(
v=>!v
);

}

};

window.addEventListener(
"keydown",
handler
);

return()=>{

window.removeEventListener(
"keydown",
handler
);

};

},[]);

if(!open) return null;

return(

<div
className="cp-overlay"
onClick={()=>setOpen(false)}
>

<div
className="cp-box"
onClick={(e)=>e.stopPropagation()}
>

<input
placeholder="Search commands..."
className="cp-input"
autoFocus
/>

<div className="cp-list">

{

commands.map(cmd=>(

<div
key={cmd}
className="cp-item"
>

{cmd}

</div>

))

}

</div>

</div>

</div>

)

}