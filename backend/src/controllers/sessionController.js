import Chat from "../models/Chat.js";

// 1. Sidebar ke liye saare unique sessions lana (Sirf logged-in user ke)
export const getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id; // 🚨 Protect middleware ne jo ID bheji thi

    // MongoDB Aggregation: Har session ka latest title aur time nikalega
    const sessions = await Chat.aggregate([
      { $match: { userId: userId } }, // Sirf is user ki chats
      { $sort: { createdAt: -1 } },
      { 
        $group: {
          _id: "$sessionId",
          title: { $first: "$title" },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } } // Naye sessions sabse upar
    ]);

    // Frontend ko 'id' aur 'title' chahiye hota hai mostly
    const formattedSessions = sessions.map(s => ({
      id: s._id,
      title: s.title,
      createdAt: s.createdAt
    }));

    res.json({ success: true, sessions: formattedSessions });
  } catch (error) {
    console.error("Fetch Sessions Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Ek specific session ki saari chats lana (Jab tu sidebar se kisi chat pe click kare)
export const getSessionChats = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id; // 🚨 Security check

    // Database se sirf is session aur is user ki chats laao (purani se nayi ki taraf sort karke)
    const chats = await Chat.find({ sessionId, userId }).sort({ createdAt: 1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error("Fetch Single Session Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};