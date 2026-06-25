import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({

  sessionId:{
    type:String,
    required:true
  },

  userId:{
    type:String,
    default:"guest"
  },

  title:{
    type:String,
    default:"New Chat"
  },

  message:{
    type:String,
    required:true
  },

  reply:{
    type:String,
    required:true
  },

  createdAt:{
    type:Date,
    default:Date.now
  },

  isArchived:{
    type:Boolean,
    default:false
  }

});

chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });

export default mongoose.model(
  "Chat",
  chatSchema
);
