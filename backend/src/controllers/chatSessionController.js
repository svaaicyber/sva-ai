import Chat from "../models/Chat.js";

export const getSession = async(req,res)=>{

try{

const {sessionId} = req.params;

const chats = await Chat.find({

sessionId

})

.sort({

createdAt:1

});

res.json({

success:true,

chats

});

}

catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};