import Chat from "../models/Chat.js"; // Tera jo bhi chat history ka model hai
import User from "../models/User.js"; // Agar user data bhi export karna hai

// 1. EXPORT ALL DATA
export const exportUserData = async (req, res) => {
  try {
    // Assuming you have middleware that adds user info to req.user
    const userId = req.user.uid; 

    const userChats = await Chat.find({ userId: userId }).lean();
    
    // Create a structured JSON of all user data
    const exportData = {
      appName: "SVA Intelligence Engine",
      exportedAt: new Date().toISOString(),
      totalChats: userChats.length,
      chats: userChats
    };

    res.status(200).json({ success: true, data: exportData });
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: "Failed to export data" });
  }
};

// 2. CLEAR ALL CHATS
export const clearAllChats = async (req, res) => {
  try {
    const userId = req.user.uid;
    await Chat.deleteMany({ userId: userId });
    
    res.status(200).json({ success: true, message: "All chats deleted successfully" });
  } catch (error) {
    console.error("Delete Chats Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete chats" });
  }
};