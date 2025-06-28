import express from 'express'
import upload from '../config/multerCloudinary.js';


import { registerPatient } from '../controllers/patientControllers/registerController.js';
import { getPatientById } from '../controllers/patientControllers/getPatientData.js';
import { checkCNP, updatePatientProfile } from '../controllers/patientControllers/updatePatientProfile.js';
import { createAppFeedback } from '../controllers/patientControllers/Feedback/createAppFeedback.js';
import getPatientFeedbackByID from '../controllers/patientControllers/Feedback/getPatientFeedbackByID.js';
import getPatientMedicalHistory from '../controllers/patientControllers/MedicalHistory/getPatientMedicalHistory .js';


const patientRoutes = express.Router();

patientRoutes.put("/update-patient-profile/:patientID",
  upload.single("profileImage"),
  updatePatientProfile
);

patientRoutes.post('/check-cnp', checkCNP)

patientRoutes.post('/register-patient', registerPatient);

patientRoutes.get('/get-patient-by-ID/:patientID', getPatientById)


// --------------------  FEEDBACK  --------------------
patientRoutes.post('/create-appointment-feedback', createAppFeedback)
patientRoutes.post('/get-feedback-by-id', getPatientFeedbackByID)


// --------------------  MEDICAL  HISTORY  --------------------
patientRoutes.post('/get-medical-history', getPatientMedicalHistory)



export default patientRoutes;