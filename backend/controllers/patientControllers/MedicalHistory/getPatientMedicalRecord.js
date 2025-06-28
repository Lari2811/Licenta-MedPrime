import patientModel from "../../../models/patientModel.js";
import appointmentModel from "../../../models/appointmentModel.js";
import investigationModel from "../../../models/investigationModel.js";
import doctorModel from "../../../models/doctorModel.js";
import locationModel from "../../../models/locationModel.js";
import medicalSheetModel from "../../../models/medicalSheet.js";
import specialityModel from "../../../models/specialityModel.js";

const getPatientMedicalRecord = async (req, res) => {
  const { patientID } = req.body;

  if (!patientID) {
    return res.status(400).json({ message: "Lipsește patientID." });
  }

  try {
    // Gasim pacientul
    const patient = await patientModel.findOne({ patientID }).lean();
    if (!patient) {
      return res.status(404).json({ message: "Pacientul nu a fost găsit." });
    }

    // Gasim toate programarile pacientului fara cele anulate)
    const appointments = await appointmentModel.find({
      patientID,
      status: { $ne: "anulata" }
    }).lean();

    // Extragem ID-urile necesare
    const investigationIDs = [...new Set(appointments.map(appt => appt.investigationID))];
    const doctorIDs = [...new Set(appointments.map(appt => appt.doctorID))];
    const locationIDs = [...new Set(appointments.map(appt => appt.locationID))];
    const appointmentIDs = appointments.map(appt => appt.appointmentID);

    // Cautam datele în paralel
    const [investigations, doctors, locations, medicalSheets] = await Promise.all([
      investigationModel.find({ investigationID: { $in: investigationIDs } }).lean(),
      doctorModel.find({ doctorID: { $in: doctorIDs } }).lean(),
      locationModel.find({ locationID: { $in: locationIDs } }).lean(),
      medicalSheetModel.find({ appointmentID: { $in: appointmentIDs } }).lean(),
    ]);

    //Obtinem si specialitatile medicilor
    const specialityIDs = [...new Set(doctors.map(doc => doc.specialityID))];
    const specialities = await specialityModel.find({ specialityID: { $in: specialityIDs } }).lean();

    // Conbinam informatiile 
    const detailedAppointments = appointments.map((appt) => {
      const investigation = investigations.find(inv => inv.investigationID === appt.investigationID);
      const doctor = doctors.find(doc => doc.doctorID === appt.doctorID);
      const location = locations.find(loc => loc.locationID === appt.locationID);
      const medicalSheet = medicalSheets.find(sheet => sheet.appointmentID === appt.appointmentID);
      const speciality = specialities.find(sp => sp.specialityID === appt.specialityID);

      return {
        ...appt,
        investigationName: investigation?.name || "Nespecificat",
        doctorName: doctor ? `${doctor.lastName} ${doctor.firstName}` : "Necunoscut",
        specialityName: speciality?.name || "—",
        locationName: location?.clinicName || "Necunoscut",
        medicalSheet: medicalSheet || null
      };
    });

    // Raspuns final
    res.status(200).json({
      success: true,
      data: {
        patient,
        appointments: detailedAppointments,
      },
    });

  } catch (error) {
    console.error("Eroare la preluarea dosarului pacientului:", error);
    res.status(500).json({ message: "Eroare la preluare dosar medical." });
  }
};

export default getPatientMedicalRecord;
