import userModel from "../../models/userModel.js";
import patientModel from "../../models/patientModel.js";
import doctorModel from "../../models/doctorModel.js";
import adminModel from "../../models/adminModel.js";

import bcrypt from "bcryptjs";
import logAction from "../../utils/logAction.js";

const updateUserPassword = async (req, res) => {
  const { userID, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ linkedID: userID });
    if (!user) {
      return res.status(404).json({ success:false, message: "User-ul nu a fost găsit!" });
    }

    //  Generează hash pentru noua parola
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //  Actualizeaza parola in userModel
    user.password = hashedPassword;
    await user.save();

    const userRole = user.role;

    let roleDescriere;
    if (user.role === 'doctor') roleDescriere = 'Doctorul';
    else if (user.role === 'patient') roleDescriere = 'Pacientul';
    else if (user.role === 'admin') roleDescriere = 'Administratorul';
    else roleDescriere = 'Utilizatorul'; 
    
    const description = `${roleDescriere} ${userID} și-a schimbat parola.`;

    await logAction({
      actionType: "UPDATE_PASSWORD",
      description: description,
      userId: userID,
      userRole: user.role,
      ipAddress: req.ip,
    });


    res.status(200).json({success: true, message: "Parola a fost actualizată cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizare parolă:", error);
    res.status(500).json({ success:false, message: "Eroare la actualizare parolă.", error: error.message });
  }
};

const updateUserEmail = async (req, res) => {
  const { userID, newEmail } = req.body;

  try {
    const user = await userModel.findOne({ linkedID: userID });
    if (!user) {
      return res.status(404).json({ success: false, message: "User-ul nu a fost găsit!" });
    }

    user.email = newEmail;
    await user.save();

    let roleDescriere;
    let targetModel = null;

    if (user.role === 'doctor') {
      roleDescriere = 'Doctorul';
      targetModel = doctorModel;
    } else if (user.role === 'patient') {
      roleDescriere = 'Pacientul';
      targetModel = patientModel;
    } else if (user.role === 'admin') {
      roleDescriere = 'Administratorul';
      targetModel = adminModel;
    } else {
      roleDescriere = 'Utilizatorul';
    }

    console.log("save in user")
    console.log("id:", user.role, "  ID");

    if (targetModel) {
      const entity = await targetModel.findOne({ [`${user.role}ID`]: userID });
      if (entity) {
        entity.email = newEmail;
        await entity.save();
      }
    }

    const description = `${roleDescriere} ${userID} și-a schimbat email-ul.`;

    await logAction({
      actionType: "UPDATE_EMAIL",
      description: description,
      userId: userID,
      userRole: user.role,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Email-ul a fost actualizat cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizare email:", error);
    res.status(500).json({ success: false, message: "Eroare la actualizare email.", error: error.message });
  }
};

export {
    updateUserPassword,
    updateUserEmail

}