import express from 'express'
import upload from '../config/multerCloudinary.js';

import { getDoctorFullDetails } from "../controllers/doctorControllers/getAllDoctorInfos.js";
import { updateAllDoctorProfile } from "../controllers/doctorControllers/updateAllDoctorProfile.js";
import { updateDoctorPersonalInfo, updateDoctorProfessionalInfo, updateDoctorProfileInfo } from '../controllers/doctorControllers/updateDoctorInfo.js';
import { createRequest, deleteRequestByReqID, getAllRequests, getDoctorRequestsByDocID, updateRequest } from '../controllers/doctorControllers/requestsController.js';
import getDoctorFeedbackByID from '../controllers/doctorControllers/getDoctorFeedbackByID.js';
import getDoctorPatients from '../controllers/doctorControllers/getPatientFile.js';
import getPatientMedicalRecord from '../controllers/patientControllers/MedicalHistory/getPatientMedicalRecord.js';
import getDoctorDashboardData from '../controllers/doctorControllers/getDoctorDashboardData.js';
import { getDoctorBasicByID } from '../controllers/doctorControllers/getDoctorInfoBasic.js';



const doctorRoutes = express.Router();

doctorRoutes.get('/get-all-doctor-infos/:doctorID', getDoctorFullDetails);

doctorRoutes.put(
  "/update-all-doctor-profile/:doctorID",
  upload.single("profileImage"),
  updateAllDoctorProfile
);


doctorRoutes.put(
  "/update-doctor-personal-info/:doctorID",
  upload.single("profileImage"),
  updateDoctorPersonalInfo
);

doctorRoutes.put('/update-doctor-professional-info/:doctorID', updateDoctorProfessionalInfo);
doctorRoutes.put('/update-doctor-profile-info/:doctorID', updateDoctorProfileInfo);

doctorRoutes.post('/get-doctor-by-id', getDoctorBasicByID);


doctorRoutes.post("/create-request", createRequest);
doctorRoutes.get("/get-doctor-requests/:doctorID", getDoctorRequestsByDocID);
doctorRoutes.get("/get-all-requests", getAllRequests); 
doctorRoutes.delete("/delete-doctor-request/:requestID", deleteRequestByReqID);
doctorRoutes.patch("/update-request/:requestID", updateRequest);


// --------------------  FEEDBACK  --------------------
doctorRoutes.post('/get-feedback-by-id', getDoctorFeedbackByID)


// --------------------  MEDICAL  HISTORY  --------------------
doctorRoutes.post('/get-doctor-patients', getDoctorPatients)
doctorRoutes.post('/get-patient-medical-record', getPatientMedicalRecord)


// --------------------  DASHBOARD  --------------------
doctorRoutes.post('/get-doctor-dashboard-data', getDoctorDashboardData)


export default doctorRoutes;