import bcrypt from "bcryptjs";
import userModel from "../../models/userModel.js";

export const addUserByAdmin = async (req, res) => {
  try {
    const { email, password, role, linkedID } = req.body;

    if (!email || !password || !role || !linkedID) {
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii.",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Emailul este deja folosit.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      role,
      linkedID,
      mustCompleteProfile: role === "doctor", 
    });

    res.status(201).json({
      success: true,
      message: "Utilizator creat cu succes.",
      userID: newUser._id,
    });
  } catch (error) {
    console.error("Eroare la crearea utilizatorului:", error);
    res.status(500).json({
      success: false,
      message: "Eroare server. Nu s-a putut crea utilizatorul.",
    });
  }
};
