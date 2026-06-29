import mongoose from "mongoose";

const librarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true }, // Image ka link
  prompt: { type: String }, // User ne kya maanga tha
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Library", librarySchema);