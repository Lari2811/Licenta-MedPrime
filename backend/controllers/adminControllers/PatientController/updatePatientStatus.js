import patientModel from "../../../models/patientModel.js";

import { io } from "../../../server.js";

export const updatePatientStatus = async (req, res) => {
  const { patientID, status } = req.body;

  if (!patientID || !status) {
    return res.status(400).json({ success: false, message: "Lipsesc datele necesare (patientID sau status)." });
  }

  try {
    const updatedPatient = await patientModel.findOneAndUpdate(
      { patientID },
      { status },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: "Pacientul nu a fost găsit." });
    }

    io.emit('PATIENT_STATUS_UPDATE', {
        message: `Adminul a modificat statusul pacientului ${patientID} `,
        patientID: patientID,
        newStatus: status,
        
    });


    res.status(200).json({
      success: true,
      message: `Statusul pacientului a fost actualizat în "${status}".`,
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Eroare actualizare status pacient:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la actualizarea statusului pacientului.",
    });
  }
};
