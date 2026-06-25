import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    createdBy: { type: String, default: "system" },
    isCustom: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);