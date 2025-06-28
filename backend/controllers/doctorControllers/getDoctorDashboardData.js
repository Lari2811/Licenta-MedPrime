import doctorModel from "../../models/doctorModel.js";
import appointmentModel from "../../models/appointmentModel.js";
import investigationModel from "../../models/investigationModel.js";
import patientModel from "../../models/patientModel.js";
import locationModel from "../../models/locationModel.js";
import specialityModel from "../../models/specialityModel.js";
import patientFeedbackModel from "../../models/patientFeedbackModel.js";

const getDoctorDashboardData = async (req, res) => {
  const { doctorID } = req.body;

  if (!doctorID) {
    return res.status(400).json({ message: "Lipsește doctorID." });
  }

  try {
    const doctor = await doctorModel.findOne({ doctorID }).lean();
    if (!doctor) {
      return res.status(404).json({ message: "Medicul nu a fost găsit." });
    }

    const appointments = await appointmentModel.find({ doctorID }).lean();
    const appointmentIDs = appointments.map(appt => appt.appointmentID);
    const patientIDs = [...new Set(appointments.map(appt => appt.patientID))];
    const investigationIDs = [...new Set(appointments.map(appt => appt.investigationID))];
    const locationIDs = [...new Set(appointments.map(appt => appt.locationID))];
    const specialityIDs = [...new Set(appointments.map(appt => appt.specialityID))];

    const [patients, investigations, locations, specialities, feedbacks] = await Promise.all([
      patientModel.find({ patientID: { $in: patientIDs } }).lean(),
      investigationModel.find({ investigationID: { $in: investigationIDs } }).lean(),
      locationModel.find({ locationID: { $in: locationIDs } }).lean(),
      specialityModel.find({ specialityID: { $in: specialityIDs } }).lean(),
      patientFeedbackModel.find({ appointmentID: { $in: appointmentIDs } }).lean(),
    ]);

    const detailedAppointments = appointments.map(appt => {
      const patient = patients.find(p => p.patientID === appt.patientID);
      const investigation = investigations.find(inv => inv.investigationID === appt.investigationID);
      const location = locations.find(loc => loc.locationID === appt.locationID);
      const speciality = specialities.find(spec => spec.specialityID === appt.specialityID);
      const relatedFeedback = feedbacks.filter(fb => fb.appointmentID === appt.appointmentID);

      return {
        ...appt,
        patientName: patient ? `${patient.lastName} ${patient.firstName}` : "Necunoscut",
        investigationName: investigation?.name || "Nespecificat",
        locationName: location?.clinicName || "Necunoscut",
        specialityName: speciality?.name || "Nespecificat",
        feedbacks: relatedFeedback,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        doctor,
        appointments: detailedAppointments,
      },
    });
  } catch (error) {
    console.error("Eroare la preluarea datelor dashboardului medicului:", error);
    res.status(500).json({ message: "Eroare internă la preluare date dashboard." });
  }
};

export default getDoctorDashboardData;
