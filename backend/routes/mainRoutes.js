import express from 'express'
import upload from '../config/multerCloudinary.js';
import { getUserById } from '../controllers/mainControllers/userControler.js';
import { verifyUserPassword } from '../controllers/mainControllers/verifyUserPassword.js';
import { updateUserEmail, updateUserPassword } from '../controllers/mainControllers/updateUserItem.js';
import { createRequest } from '../controllers/mainControllers/createRequest.js';
import { getAllActiveDoctors } from '../controllers/mainControllers/DisplayDataGeneral/Doctors/getAllActiveDoctorsWithData.js';
import { getInvestigationsAndSpecialityByLocation } from '../controllers/mainControllers/DisplayDataGeneral/Locations/getInvestigationsAndSpecialityByLocation.js';
import { getSpecialitiesWithData } from '../controllers/mainControllers/DisplayDataGeneral/Specialitites/getSpecialitiesWithData.js';
import { getAppointmentOptions } from '../controllers/mainControllers/Appointment/getAppointmentOptions.js';
import { getAvailableSlots } from '../controllers/mainControllers/Appointment/getAvailableSlots.js';
import { getDoctorSchedule } from '../controllers/mainControllers/Appointment/getDoctorSchedule.js';
import { createAppointment } from '../controllers/mainControllers/Appointment/createAppointment.js';
import { getAppointmentsByID } from '../controllers/mainControllers/Appointment/getAppointmentsByID.js';
import { cancelAppointment } from '../controllers/mainControllers/Appointment/cancelAppointment.js';
import { updateAppointmentStatus } from '../controllers/mainControllers/Appointment/updateAppointmentStatus.js';
import { saveMedicalSheet } from '../controllers/mainControllers/Appointment/saveMedicalSheet.js';

const mainRoutes = express.Router();


mainRoutes.get('/get-user-by-ID/:userID', getUserById);
mainRoutes.post('/verify-user-password', verifyUserPassword);
mainRoutes.put('/update-user-password', updateUserPassword);
mainRoutes.put('/update-user-email', updateUserEmail);



mainRoutes.post("/create-request", createRequest);


// ---------------------------- FOR  HOME  PAGE ----------------------------
mainRoutes.get('/get-all-active-doctors-with-data', getAllActiveDoctors) 


// ---------------------------- FOR  LOCATION  PAGE ----------------------------
mainRoutes.post('/get-investigations-and-specialities-by-location', getInvestigationsAndSpecialityByLocation)


// ---------------------------- FOR  SPECIALITY  PAGE ----------------------------
mainRoutes.get('/get-specialities-with-data', getSpecialitiesWithData)


// ---------------------------- FOR  APPOINTMENT  PAGE ----------------------------
mainRoutes.get('/appointment-options', getAppointmentOptions);

mainRoutes.post('/get-available-slots', getAvailableSlots)

mainRoutes.get('/get-doctor-schedule', getDoctorSchedule)

mainRoutes.post('/create-appointment', createAppointment)

mainRoutes.post('/get-appointments-by-id', getAppointmentsByID)
mainRoutes.post('/cancel-appointment', cancelAppointment)

mainRoutes.post('/update-appointment-status', updateAppointmentStatus)

mainRoutes.post('/save-medical-sheet', upload.array('atasamente'), saveMedicalSheet);




export default mainRoutes;