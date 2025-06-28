import doctorModel from '../../../models/doctorModel.js';
import patientModel from '../../../models/patientModel.js';
import appointmentModel from '../../../models/appointmentModel.js';
import locationModel from '../../../models/locationModel.js';
import specialityModel from '../../../models/specialityModel.js';
import specialityLocationModel from '../../../models/specialityLocationModel.js';
import investigationModel from '../../../models/investigationModel.js';
import ActionLog from '../../../models/actionLogModel.js';
import adminModel from '../../../models/adminModel.js';

const getAdminDashboardData = async (req, res) => {
  try {
    const { adminID } = req.body;

    if (!adminID) {
      return res.status(400).json({ message: "adminID lipsă din body." });
    }

    const admin = await adminModel.findOne({ adminID });

    if (!admin) {
      return res.status(404).json({ message: "Administratorul nu a fost găsit." });
    }

    const [
      doctors,
      patients,
      appointments,
      locations,
      specialities,
      specialityLocations,
      investigations,
      logActions
    ] = await Promise.all([
      doctorModel.find({}, { doctorID: 1, firstName: 1, lastName: 1, email: 1, createdAt: 1, status: 1, rating: 1 }),
      patientModel.find({}, { patientID: 1, firstName: 1, lastName: 1, email: 1, createdAt: 1, status: 1 }),
      appointmentModel.find({}, { appointmentID: 1, doctorID: 1, patientID: 1, status: 1, createdAt: 1 }),
      locationModel.find({}, { locationID: 1, clinicName: 1, status: 1, createdAt: 1 }),
      specialityModel.find({}, { specialityID: 1, name: 1, createdAt: 1 }),
      specialityLocationModel.find({}, { specialityID: 1, locationID: 1, active: 1 }),
      investigationModel.find({}, { investigationID: 1, name: 1, createdAt: 1 }),
      ActionLog.find({}, { logID: 1, userID: 1, action: 1, timestamp: 1 })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        admin,
        doctors,
        patients,
        appointments,
        locations,
        specialities,
        specialityLocations,
        investigations,
        logActions
      }
    });

  } catch (err) {
    console.error(" Eroare la getAdminDashboardData:", err);
    return res.status(500).json({ message: "Eroare server la încărcarea dashboard-ului admin." });
  }
};



export {
  getAdminDashboardData
};
