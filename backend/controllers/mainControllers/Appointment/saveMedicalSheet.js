import medicalSheetModel from '../../../models/medicalSheet.js';
import appointmentModel from '../../../models/appointmentModel.js';
import cloudinary from '../../../utils/cloudinary.js';
import logAction from '../../../utils/logAction.js';
import { io } from '../../../server.js';



const generateMedicalSheetID = async () => {
  const lastMedicalSheet = await medicalSheetModel
    .findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!lastMedicalSheet || !lastMedicalSheet.medicalSheetID) {
    return 'MS001';
  }

  const lastNumber = parseInt(lastMedicalSheet.medicalSheetID.replace('MS', ''), 10) || 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `MS${newNumber}`;
};


export const saveMedicalSheet = async (req, res) => {
  
  try {
    const { appointmentID, patientID, doctorID, diagnostic, rezumat,
      recomandari, trimiteri, treatments} = req.body;

    const parsedTreatments = JSON.parse(treatments);
    const uploadedFiles = req.files?.map(file => file.path) || [];

    const existing = await medicalSheetModel.findOne({ appointmentID });
    if (existing) {
      console.warn(" Fișă deja existentă pentru această programare.");
      return res.status(409).json({ message: "Fișa medicală a fost deja trimisă pentru această programare." });
    }

    const medicalSheetID = await generateMedicalSheetID();
    const sheet = new medicalSheetModel({
      medicalSheetID, appointmentID, patientID, doctorID, diagnostic, rezumat, recomandari, trimiteri, 
      treatments: parsedTreatments,  atasamente: uploadedFiles
    });
    await sheet.save();
  
    const apptUpdate = await appointmentModel.findOneAndUpdate(
      { appointmentID },
      { doctorFeedbackGiven: true }
    );

    io.emit("patientMedicalHistoryAdded", {
      medicalHistory: medicalSheetID,
      appointmentID,
      doctorID,
    });
    
    res.status(201).json({ message: 'Fișa medicală a fost salvată cu succes!' });

  } catch (error) {
    console.error(' Eroare la salvarea fișei medicale:', error);
    res.status(500).json({ error: 'Eroare la salvarea fișei medicale' });
  }
};

