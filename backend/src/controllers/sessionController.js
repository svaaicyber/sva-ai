console.log("HELLO FROM SESSION CONTROLLER");

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

export const getSessionChats = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chats = await Chat.find({
      sessionId,
      userId
    }).sort({ createdAt: 1 });

    console.log("========== SESSION ==========");
    console.log("Session:", sessionId);
    console.log(JSON.stringify(chats, null, 2));
    console.log("=============================");

    res.json({
      success: true,
      chats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false
    });
  }
};