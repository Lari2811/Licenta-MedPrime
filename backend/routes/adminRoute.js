import express from 'express'
import upload from '../config/multerCloudinary.js';

import { createUser, loginAdmin } from '../controllers/adminController.js';
import authAdmin from '../middleware/authAdmin.js';

import { getUniqueCounties } from '../controllers/adminControllers/LocationController/getCounties.js';

import { getAllSpecialitiesWithLocations } from '../controllers/adminControllers/SpecialityController/getAllSpecialities.js';
import { getAll_INV_SPEC, getAllInvestigations, getAllInvestigationsAvailability } from '../controllers/adminControllers/InvestigationController/getAllInvestigationsInfos.js';
import { getInvestigationsForSpeciality } from '../controllers/adminControllers/InvestigationController/getInvestigationsForSpeciality.js';
import { getInvestigationDetailsTable } from '../controllers/adminControllers/InvestigationController/getInfoForDisplayTable.js';
import { addUserByAdmin } from '../controllers/adminControllers/addUserByAdmin.js';
import { getAllDoctorsWithLocations } from '../controllers/adminControllers/DoctorController/getAllDoctorsWithLocations.js';
import { getAllAdmins } from '../controllers/adminControllers/getAllAdmins.js';
import { getAllPatientsWithDetails } from '../controllers/adminControllers/PatientController/getAllPatiens.js';
import { addLocation } from '../controllers/adminControllers/LocationController/addLocation.js';
import { getAllSpecialities, getAllSpecialityLocations } from '../controllers/adminControllers/SpecialityController/getAllSpecialitiesAndLocations.js';
import { addSpeciality } from '../controllers/adminControllers/SpecialityController/addSpeciality.js';
import { addSpecialityLocations } from '../controllers/adminControllers/SpecialityController/addSpecialityLocations.js';
import { addInvestigation } from '../controllers/adminControllers/InvestigationController/addInvestigation.js';
import { addInvestigationAvailability } from '../controllers/adminControllers/InvestigationController/addInvestigationsAvailability.js';
import { addLocation_Specialities} from '../controllers/adminControllers/LocationController/addLocation_Specialities.js';
import { addDoctor } from '../controllers/adminControllers/DoctorController/addDoctor.js';
import { addDoctorSpecialitiesAndLocations } from '../controllers/adminControllers/DoctorController/addDoctorSpecialitiesAndLocations.js';
import { getDoctorsByLocation, getDoctorsByLocationWithInfos, getInvestigationsByLocation, getSpecialitiesByLocation } from '../controllers/adminControllers/GetRelatedInformations/getSomethingByLocation.js';
import { getDoctorsBySpeciality, getInvestigationsBySpeciality, getLocationsBySpeciality } from '../controllers/adminControllers/GetRelatedInformations/getInfoBySpeciality.js';
import { getExtendedLocations } from '../controllers/adminControllers/GetRelatedInformations/getExtendedLocations.js';
import { getLocationsByInvestigation, getSpecialitiesByInvestigation } from '../controllers/adminControllers/GetRelatedInformations/getSomethingByInvestigation.js';
import { getExtendedInvestigations } from '../controllers/adminControllers/GetRelatedInformations/getExtendedInvestigations.js';
import { getAllLocations } from '../controllers/adminControllers/LocationController/getAllLocationsInfos.js';
import { getAllActiveDoctors } from '../controllers/mainControllers/DisplayDataGeneral/Doctors/getAllActiveDoctorsWithData.js';
import { getActiveSpecialitiesWithLocations } from '../controllers/adminControllers/SpecialityController/getSpecialititesWithLocations.js';
import { getAdminByID } from '../controllers/adminControllers/getAdminByID.js';
import { deleteDoctorAndCancelAppointments, getDoctorInfoSummary } from '../controllers/adminControllers/DoctorController/deleteDoctor.js';
import { updatePatientStatus } from '../controllers/adminControllers/PatientController/updatePatientStatus.js';
import { getAllAppointments } from '../controllers/adminControllers/AppointmentController/getAllAppointments.js';
import { getAdminDashboardData } from '../controllers/adminControllers/Dashboard/getAdminDasboardData.js';
import { deleteLocationAndCancelAppointments, getLocationInfoSummary } from '../controllers/adminControllers/LocationController/deleteLocation.js';
import { deleteInvestigationAndCancelAppointments, getInvestigationInfoSummary } from '../controllers/adminControllers/InvestigationController/deleteInvestigation.js';
import { deleteSpecialityAndCancelAppointments, getSpecialityInfoSummary } from '../controllers/adminControllers/SpecialityController/deleteSpeciality.js';


const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin)

adminRouter.post('/create-user', createUser)

adminRouter.post('/add-user-by-admin', upload.none(), addUserByAdmin)

adminRouter.get("/get-all-admins", getAllAdmins);

adminRouter.post('/get-admin-by-id', getAdminByID);


 // ============================= LOCATION =============================
adminRouter.post('/add-location', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 15 },
]), addLocation);

adminRouter.post('/add-location-specialities', addLocation_Specialities)

adminRouter.get('/get-counties', getUniqueCounties);

adminRouter.get('/get-all-locations', getAllLocations);

adminRouter.post('/get-location-summary', getLocationInfoSummary)
adminRouter.delete('/delete-location/:locationID', deleteLocationAndCancelAppointments)



// ============================= SPECIALITY =============================
adminRouter.post('/add-speciality',
  upload.fields([{ name: 'profileImage', maxCount: 1 }]),
  addSpeciality
)

adminRouter.post('/add-speciality-locations', addSpecialityLocations)

adminRouter.get('/get-all-specialities', getAllSpecialities)
adminRouter.get('/get-all-speciality-locations', getAllSpecialityLocations)

adminRouter.get('/get-speciality-locations', getActiveSpecialitiesWithLocations);

adminRouter.get('/get-all-specialities-loc', getAllSpecialitiesWithLocations);

adminRouter.post("/get-speciality-summary", getSpecialityInfoSummary);
adminRouter.delete('/delete-speciality/:specialityID', deleteSpecialityAndCancelAppointments)



// ============================= INVESTIGATION =============================
adminRouter.post('/add-investigation',
  upload.fields([{ name: 'profileImage', maxCount: 1 }]),
  addInvestigation
)

adminRouter.post('/add-investigation-availability', addInvestigationAvailability);

adminRouter.get('/get-all-investigations', getAllInvestigations);
adminRouter.get('/get-all-investigations-availability', getAllInvestigationsAvailability);
adminRouter.get('/get-all-INV-SPEC', getAll_INV_SPEC)

adminRouter.get('/get-investigation-for-speciality', getInvestigationsForSpeciality)

adminRouter.get('/get-investigation-details', getInvestigationDetailsTable);

adminRouter.post('/get-investigation-summary', getInvestigationInfoSummary)
adminRouter.delete('/delete-investigation/:investigationID', deleteInvestigationAndCancelAppointments)



// ============================= DOCTOR =============================
adminRouter.post('/add-doctor', 
  upload.none(), 
  addDoctor)

adminRouter.post('/add-doctor-specialities-locations', addDoctorSpecialitiesAndLocations)

adminRouter.get('/get-all-doctors-with-locations', getAllDoctorsWithLocations);



// ============================= PATIENT =============================
adminRouter.get('/get-all-patients', getAllPatientsWithDetails);
adminRouter.patch('/update-patient-status',updatePatientStatus)



// ============================= APPOINTMENT =============================
adminRouter.get('/get-all-appointments', getAllAppointments)



// ============================= DASHBOARD =============================
adminRouter.post('/get-admin-dashboard-data', getAdminDashboardData);



// =============================  RELATED  INFORMATIONS   =============================

// ADMIN  MODAL  TABLE
// ------------------------------  GET  SOMETHING  BY  LOCATION  ------------------------------
adminRouter.post('/get-doctors-by-location', getDoctorsByLocation);
adminRouter.post('/get-doctors-by-location-with-info', getDoctorsByLocationWithInfos);
adminRouter.post('/get-specialities-by-location', getSpecialitiesByLocation);
adminRouter.post('/get-investigations-by-location', getInvestigationsByLocation)


// ------------------------------  GET  SOMETHING  BY  SPECIALITY  ------------------------------
adminRouter.post('/get-doctors-by-speciality', getDoctorsBySpeciality);
adminRouter.post('/get-locations-by-speciality', getLocationsBySpeciality);
adminRouter.post('/get-investigations-by-speciality', getInvestigationsBySpeciality);


// ------------------------------  GET  SOMETHING  BY  INVESTIGATION  ------------------------------
adminRouter.post('/get-locations-by-investigation', getLocationsByInvestigation)
adminRouter.post('/get-specialities-by-investigation', getSpecialitiesByInvestigation)


// ------------------------------ EXTENDED  INFORMATIONS  ------------------------------
adminRouter.get('/get-extended-locations', getExtendedLocations)
adminRouter.get('/get-extended-investigations', getExtendedInvestigations)

// ------------------------------ DOCTOR PAGE  ------------------------------
adminRouter.post('/get-doctor-summary', getDoctorInfoSummary)
adminRouter.delete('/delete-doctor/:doctorID', deleteDoctorAndCancelAppointments)


export default adminRouter;