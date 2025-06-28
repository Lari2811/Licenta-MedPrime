import patientModel from '../../../models/patientModel.js';
import appointmentModel from '../../../models/appointmentModel.js';
import doctorModel from '../../../models/doctorModel.js';
import specialityModel from '../../../models/specialityModel.js';
import investigationModel from '../../../models/investigationModel.js';
import locationModel from '../../../models/locationModel.js';
import medicalSheetModel from '../../../models/medicalSheet.js';
import patientFeedbackModel from '../../../models/patientFeedbackModel.js';

 const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientID } = req.body;

    if (!patientID) {
      return res.status(400).json({ success: false, message: "Lipsește patientID" });
    }

    const patient = await patientModel.findOne({ patientID });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Pacientul nu a fost găsit." });
    }

    const appointments = await appointmentModel.find({ patientID });

    const enrichedAppointments = await Promise.all(
      appointments.map(async (app) => {
        const [investigation, speciality, doctor, location, sheet, feedback] = await Promise.all([
          investigationModel.findOne({ investigationID: app.investigationID }),
          specialityModel.findOne({ specialityID: app.specialityID }),
          doctorModel.findOne({ doctorID: app.doctorID }),
          locationModel.findOne({ locationID: app.locationID }),
          medicalSheetModel.findOne({ appointmentID: app.appointmentID }),
          patientFeedbackModel.findOne({ appointmentID: app.appointmentID }),
        ]);

        return {
          ...app.toObject(),
          investigationName: investigation?.name || null,
          specialityName: speciality?.name || null,
          doctorName: doctor ? `${doctor.lastName} ${doctor.firstName}` : null,
          locationName: location?.clinicName || null,
          specialityID: app.specialityID,
          doctorID: app.doctorID,
          locationID: app.locationID,
          medicalSheet: sheet || null,
          feedback: feedback || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        appointments: enrichedAppointments,
      },
    });
  } catch (error) {
    console.error('Eroare getSinglePatientWithDetails:', error);
    res.status(500).json({ success: false, message: 'Eroare server.' });
  }
};


export default getPatientMedicalHistory;
