import appointmentModel from "../../models/appointmentModel.js";
import patientModel from "../../models/patientModel.js";

const getDoctorPatients = async (req, res) => {
  const { doctorID } = req.body;

  if (!doctorID) {
    return res.status(400).json({ message: "Lipsește doctorID." });
  }

  try {
    // Toate programările medicului
    const allAppointments = await appointmentModel.find({ doctorID }).lean();

    // patientID unici
    const uniquePatientIDs = [...new Set(allAppointments.map(appt => appt.patientID))];
    const patients = await patientModel.find({ patientID: { $in: uniquePatientIDs } }).lean();

   
     // Construim datele pentru fiecare pacient
    const results = patients.map((p) => {
      const patientAppointments = allAppointments.filter(appt => appt.patientID === p.patientID);

      const lastFinished = patientAppointments
        .filter(appt => appt.status === "finalizata")
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      const appointmentCount = patientAppointments.length;

      return {
        patientID: p.patientID,
        firstName: p.firstName,
        lastName: p.lastName,
        cnp: p.cnp,
        status: p.status || "necunoscut",
        createdAt: p.createdAt,
        lastVisit: lastFinished?.date || null,
        documentCount: appointmentCount,
      };
    });

    res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error("Eroare la preluarea pacienților:", error);
    res.status(500).json({ message: "Eroare la preluare." });
  }
};

export default getDoctorPatients;
