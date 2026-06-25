import Chat from "../models/Chat.js";

export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id; 

    if (!userId) {
      return res.json({ success: true, data: { chartData: [] } }); 
    }

    // Total lifetime interactions is authenticated account ki
    const totalInteractions = await Chat.countDocuments({ userId });

    // 🚨 FIX: Strict Midnight Cutoff for Last 7 Days (IST)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6); 
    sevenDaysAgo.setUTCHours(0, 0, 0, 0); // Start of the day taaki din ka koi ghanta miss na ho

    const activityData = await Chat.aggregate([
      { 
        $match: { 
          userId: userId, 
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt", 
              timezone: "+05:30" // Exact Indian Standard Time
            } 
          },
          prompts: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const chartData = activityData.map(item => ({
      date: item._id,
      prompts: item.prompts
    }));

    // AI Generated Artifacts Tracking (Strict Regex checking)
    const artifactStats = await Chat.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          documentsCreated: { $sum: { $cond: [{ $regexMatch: { input: "$reply", regex: /```document/i } }, 1, 0] } },
          waveformsGenerated: { $sum: { $cond: [{ $regexMatch: { input: "$reply", regex: /"type":\s*"waveform"/i } }, 1, 0] } },
          totalWords: { $sum: { $strLenCP: "$reply" } }
        }
      }
    ]);

    const stats = artifactStats[0] || { documentsCreated: 0, waveformsGenerated: 0, totalWords: 0 };

    res.json({
      success: true,
      data: {
        totalInteractions,
        documentsCreated: stats.documentsCreated,
        waveformsGenerated: stats.waveformsGenerated,
        totalWordsGenerated: Math.round(stats.totalWords / 5), // Approx words logic
        chartData
      }
    });

  } catch (error) {
    console.error("❌ ANALYTICS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch real insights." });
  }
};