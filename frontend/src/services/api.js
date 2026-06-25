const API_URL="http://localhost:5000/api/chat";

export const sendMessage=async(message)=>{

try{

const response=await fetch(

API_URL,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

userId:"vijay",
message

})

}

);

const data=await response.json();

return data.reply;

}

catch(error){

console.log(error);

return "SVA connection error";

}

}