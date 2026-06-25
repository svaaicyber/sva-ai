import Agent from "../models/Agent.js"; // Make sure tera Agent model yahan correctly imported ho

// ➕ 1. CREATE CUSTOM AGENT
export const createAgent = async (req, res) => {
  try {
    const { name, description, systemPrompt, createdBy } = req.body;

    const newAgent = new Agent({
      name,
      description,
      systemPrompt,
      createdBy: createdBy || "user", // Baad mein isko req.user.uid se replace kar sakte hain
      isCustom: true // Yeh frontend ko batayega ki ispe Delete icon dikhana hai
    });

    await newAgent.save();
    
    res.status(201).json({ success: true, agent: newAgent, message: "Agent created!" });
  } catch (error) {
    console.error("Create Agent Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating agent." });
  }
};

// 📥 2. GET ALL CUSTOM AGENTS (Yeh wala missing tha!)
export const getAgents = async (req, res) => {
  try {
    // Sirf isCustom: true wale (user ke banaye hue) agents uthayenge
    const agents = await Agent.find({ isCustom: true });
    
    // Frontend ko 'agents' key mein data bhejenge
    res.status(200).json({ success: true, agents: agents });
  } catch (error) {
    console.error("Get Agents Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching agents." });
  }
};

// 🗑️ 3. DELETE CUSTOM AGENT
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Agent.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: "Agent successfully deleted!" });
  } catch (error) {
    console.error("Delete Agent Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting agent." });
  }
};