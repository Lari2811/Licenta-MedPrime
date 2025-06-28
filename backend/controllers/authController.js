import userModel from "../models/userModel.js";

import doctorModel from "../models/doctorModel.js";
import adminModel from "../models/adminModel.js"; 
import patientModel from "../models/patientModel.js";


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logAction from "../utils/logAction.js";

import { formatName } from "../utils/formatName.js";

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validare input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email și parolă necesare." });
    }

    // Verificare utilizator existent
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email sau parolă incorectă." });
    }

    // Verificare parolă
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email sau parolă incorectă." });
    }

    // Creare token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        linkedID: user.linkedID,
      },
      process.env.JWT_SECRET,
    );

   //Structură generală răspuns
    const responsePayload = {
      token,
      role: user.role,
      userID: user.linkedID,
      mustCompleteProfile: user.mustCompleteProfile
    };   

    if (user.role === "doctor") {
      const doctor = await doctorModel.findOne({ doctorID: user.linkedID });
      if (!doctor) {
        return res.status(404).json({ message: "Doctorul nu a fost găsit." });
      }
    }

    if (user.role === "admin") {
      const admin = await adminModel.findOne({ adminID: user.linkedID });
      if (!admin) {
        return res.status(404).json({ message: "Adminul nu a fost găsit." });
      }
    }
    
    if (user.role === "patient") {
      const patient = await patientModel.findOne({ patientID: user.linkedID });
      if (!patient) {
        return res.status(404).json({ message: "Pacientul nu a fost găsit." });
      }
    }
    
    // Trimite răspunsul
    responsePayload.success = true;

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error("Eroare login:", error);
    return res.status(500).json({ success: false, message: "Eroare server" });
  }
};


//API for getting user name by role and ID
const getUserNameByIdAndRole = async (req, res) => {
  try {
    const { linkedID, role } = req.body;

    if (!linkedID || !role) {
      return res.status(400).json({ success: false, message: "Sunt necesare atât linkedID cât și role." });
    }

    let user = null;

    if (role === "doctor") {
      user = await doctorModel.findOne({ doctorID: linkedID });
    } 
    else 
     if (role === "admin") {
      user = await adminModel.findOne({ adminID: linkedID });
    } 
     else if (role === "patient") {
       user = await patientModel.findOne({ patientID: linkedID });
     }

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilizatorul nu a fost găsit." });
    }

    const fullName = `${formatName(user.lastName)}-${formatName(user.firstName)}`; 

    return res.status(200).json({
      success: true,
      name: fullName,
      role,
      linkedID
    });

  } catch (error) {
    console.error("Eroare la căutare utilizator:", error);
    return res.status(500).json({ success: false, message: "Eroare server." });
  }
};

//API for getting all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({ success: true, data: users });
  } 
  catch (error) 
  {
    console.error("Eroare la obținerea userilor:", error);
    res.status(500).json({ success: false, message: "Eroare server." });
  }
};

const verifyUserPassword = async (req, res) => {
  try {
    const { userID, password } = req.body;

    console.log("Verificare parolă pentru userID:", userID);
    console.log("Parola:", password ? "******" : "nu a fost furnizată");

    if (!userID || !password) {
      return res.status(400).json({ success: false, message: "UserID și parola sunt necesare." });
    }

    // Căutăm user-ul în baza de date
    const user = await userModel.findOne({ linkedID: userID });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilizatorul nu a fost găsit." });
    }

    // Verificăm parola
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Parola este incorectă." });
    }

    // Dacă e ok
    return res.status(200).json({
      success: true,
      message: "Parola este corectă.",
      userID: user.linkedID,
      role: user.role,
      email: user.email
    });

  } catch (error) {
    console.error("Eroare la verificarea parolei:", error);
    return res.status(500).json({ success: false, message: "Eroare de server." });
  }
};

const updateUserPassword = async (req, res) => {
  const { linkedID, newPassword, role } = req.body;

  try {
    if (!linkedID || !newPassword || !role) {
      return res.status(400).json({ success: false, message: "linkedID, noua parolă și rolul sunt necesare!" });
    }

    // 1️⃣ Caută user-ul asociat
    const user = await userModel.findOne({ linkedID, role });
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilizatorul nu a fost găsit!" });
    }

    // 2️⃣ Generează hash pentru noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3️⃣ Actualizează parola în userModel
    user.password = hashedPassword;
    await user.save();

    // 4️⃣ Logare acțiune
    await logAction({
      actionType: "UPDATE_PASSWORD",
      description: `Utilizatorul ${linkedID} (${role}) și-a schimbat parola.`,
      userId: linkedID,
      userRole: role,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Parola a fost actualizată cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizare parolă:", error);
    res.status(500).json({ success: false, message: "Eroare la actualizare parolă.", error: error.message });
  }
};

export 
{ 
    loginUser,
    getUserNameByIdAndRole,
    getAllUsers, 
    verifyUserPassword,
    updateUserPassword
}
