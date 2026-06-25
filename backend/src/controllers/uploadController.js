import pdfParse from "pdf-parse";

export const handleDocumentUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const fileBuffer = req.file.buffer;
    let extractedText = "";

    // Agar file PDF hai
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text;
    } 
    // Agar file TXT hai
    else if (req.file.mimetype === "text/plain") {
      extractedText = fileBuffer.toString("utf8");
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type. Send PDF or TXT." });
    }

    // Token limit bachane ke liye text ko thoda trim kar denge (optional)
    const safeText = extractedText.substring(0, 15000); 

    res.status(200).json({
      success: true,
      message: "Document parsed successfully",
      fileName: req.file.originalname,
      content: safeText
    });

  } catch (error) {
    console.error("DOCUMENT PARSE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to parse document." });
  }
};