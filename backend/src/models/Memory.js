import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "user_added"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Memory", memorySchema);