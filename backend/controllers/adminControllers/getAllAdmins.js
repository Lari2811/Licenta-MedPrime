import adminModel from "../../models/adminModel.js";

const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find();
    res.status(200).json({ success: true, data: admins });
  } 
  catch (error) 
  {
    console.error("Eroare la obținerea adminilor:", error);
    res.status(500).json({ success: false, message: "Eroare server." });
  }
};

export {
    getAllAdmins,
}