import "./ModelSwitcher.css";

const models=[

"Groq",
"SambaNova",
"Ollama"

];

export default function ModelSwitcher({

model,
setModel

}){

return(

<div className="model-switch">

{

models.map(m=>(

<button

key={m}

className={`model-btn ${
model===m
?"active"
:""
}`}

onClick={()=>
setModel(m)
}

>

{m}

</button>

))

}

</div>

)

}