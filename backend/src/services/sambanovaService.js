import axios from "axios";

export async function askSambaNova(message){

try{

const response = await axios.post(

"https://api.sambanova.ai/v1/chat/completions",

{

model:"Meta-Llama-3.3-70B-Instruct",

messages:[

{
role:"system",

content:`

You are SVA.

A futuristic premium AI assistant.

Keep responses concise and intelligent.

`

},

{
role:"user",
content:message
}

],

temperature:0.7,

max_tokens:700

},

{

headers:{

Authorization:
`Bearer ${process.env.SAMBANOVA_API_KEY}`,

"Content-Type":"application/json"

}

}

);

return response.data.choices[0].message.content;

}

catch(error){

console.log(
"SAMBANOVA ERROR:",
error.response?.data || error.message
);

throw error;

}

}
