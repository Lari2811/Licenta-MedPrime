import adminModel from "../../models/adminModel.js";


const getAdminByID = async (req, res) => {
  const { adminID } = req.body;

  if (!adminID) {
    return res.status(400).json({ success: false, message: "adminID lipsă în body." });
  }

  try {
    const admin = await adminModel.findOne({ adminID });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Adminul nu a fost găsit." });
    }

    res.status(200).json({ 
        success: true, 
        data: admin 
    });
  } catch (error) {
    console.error("Eroare la căutarea adminului:", error);
    res.status(500).json({ success: false, message: "Eroare la server." });
  }
};

export { getAdminByID };