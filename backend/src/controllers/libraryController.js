import Library from "../models/Library.js";

// Get user images
export const getLibraryAssets = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    const assets = await Library.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load library" });
  }
};

// Delete image
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    await Library.findOneAndDelete({ _id: id, userId });
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};