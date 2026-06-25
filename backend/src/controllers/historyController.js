import Chat from "../models/Chat.js";

/* =========================================
   📜 GET CHAT HISTORY
========================================= */
export const getHistory = async (req, res) => {
  try {
    console.log("===== HISTORY REQUEST =====");
    console.log("User:", req.user);

    const userId = req.user.id || req.user._id;

    const chats = await Chat.find({
      userId,
      isArchived: { $ne: true }
    }).sort({ createdAt: -1 });

    console.log("Chats Found:", chats.length);

    // Group chats by sessionId
    const sessionMap = new Map();

    chats.forEach((chat) => {
      if (!sessionMap.has(chat.sessionId)) {
        sessionMap.set(chat.sessionId, {
          _id: chat.sessionId,
          title: chat.title || "New Chat",
          lastUpdated: chat.createdAt
        });
      }
    });

    const sessions = [...sessionMap.values()];

    console.log("Sessions:", sessions);

    res.json({
      success: true,
      sessions
    });

  } catch (err) {
    console.error("History Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =========================================
   🗑 DELETE SESSION
========================================= */
export const deleteSession = async (req, res) => {
  try {

    const { sessionId } = req.params;

    await Chat.deleteMany({
      sessionId,
      userId: req.user.id || req.user._id
    });

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

/* =========================================
   📦 ARCHIVE SESSION
========================================= */
export const archiveSession = async (req, res) => {
  try {

    const { sessionId } = req.params;

    await Chat.updateMany(
      {
        sessionId,
        userId: req.user.id || req.user._id
      },
      {
        $set: {
          isArchived: true
        }
      }
    );

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};