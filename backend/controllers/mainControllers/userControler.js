import userModel from "../../models/userModel.js";
import patientModel from "../../models/patientModel.js";

import bcrypt from "bcryptjs";

import { generatePatientID } from "../../utils/generatePatientID.js";

const getUserById = async (req, res) => {
 try {
    const { userID } = req.params;

    const user = await userModel.findOne({ linkedID: userID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User cu ID-ul ${userID} nu a fost găsit.`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `User cu ID-ul ${userID} a fost găsit.`,
    });

  } catch (error) {
    console.error('Eroare la getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare server. Încearcă din nou.',
    });
  }
};
  




export {
    getUserById,
}
