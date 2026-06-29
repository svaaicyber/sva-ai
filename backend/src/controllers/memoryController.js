import Memory from "../models/Memory.js";

// 1. Fetch User's Memories
export const getMemories = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, memories });
  } catch (error) {
    console.error("Get Memory Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch memory" });
  }
};

// 2. Add New Memory
export const addMemory = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text) return res.status(400).json({ success: false, message: "Text is required" });

    const newMemory = await Memory.create({ userId, text });
    res.json({ success: true, memory: newMemory });
  } catch (error) {
    console.error("Add Memory Error:", error);
    res.status(500).json({ success: false, message: "Failed to save memory" });
  }
};

// 3. Delete Single Memory
export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    await Memory.findOneAndDelete({ _id: id, userId }); // Ensure user can only delete their own
    res.json({ success: true, message: "Memory erased" });
  } catch (error) {
    console.error("Delete Memory Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete memory" });
  }
};

// 4. Wipe All Memories for User
export const wipeMemories = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Memory.deleteMany({ userId });
    res.json({ success: true, message: "All memory wiped successfully" });
  } catch (error) {
    console.error("Wipe Memory Error:", error);
    res.status(500).json({ success: false, message: "Failed to wipe memory" });
  }
};