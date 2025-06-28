import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";


const verifyUserPassword = async (req, res) => {
  const { userID, currentPassword } = req.body;

  try {
    
    const user = await userModel.findOne({ linkedID: userID });
    if (!user) { 
      return res.status(404).json({success: false,  message: "User-ul nu a fost găsit!" });
    }

    // Compara parola primita cu hash-ul din baza de date
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success:false, message: "Parola actuală este incorectă!" });
    }

    res.status(200).json({ success:true, message: "Parola este corectă!" });

  } catch (error) {
    console.error("Eroare la verificare parolă:", error);
    res.status(500).json({ success:false, message: "Eroare la verificare parolă.", error: error.message });
  }
};

export {
    verifyUserPassword
}