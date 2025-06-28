import patientFeedbackModel from "../../../models/patientFeedbackModel.js";
import doctorModel from "../../../models/doctorModel.js";
import appointmentModel from "../../../models/appointmentModel.js";
import investigationModel from "../../../models/investigationModel.js";

const getPatientFeedbackByID = async (req, res) => {
  const { patientID } = req.body;

  if (!patientID) {
    return res.status(400).json({ message: "Lipsește patientID." });
  }

  try {
    const feedbacks = await patientFeedbackModel.find({ patientID }).lean();

    // Toti doctorii implicaii
    const doctorIDs = feedbacks.map(fb => fb.doctorID);
    const doctors = await doctorModel.find({ doctorID: { $in: doctorIDs } }).lean();

    // Toate appointment-urile implicate
    const appointmentIDs = feedbacks.map(fb => fb.appointmentID);
    const appointments = await appointmentModel.find({ appointmentID: { $in: appointmentIDs } }).lean();

    // Toate investigationID-urile
    const investigationIDs = appointments.map(appt => appt.investigationID);
    const investigations = await investigationModel.find({ investigationID: { $in: investigationIDs } }).lean();

    // Combinam datele
    const feedbacksWithDetails = feedbacks.map(fb => {
      const doctor = doctors.find(doc => doc.doctorID === fb.doctorID);
      const appointment = appointments.find(appt => appt.appointmentID === fb.appointmentID);
      const investigation = investigations.find(inv => inv.investigationID === appointment?.investigationID);

      return {
        ...fb,
        doctorInfo: doctor || null,
        appointmentInfo: appointment || null,
        investigationName: investigation?.name || null,
      };
    });

    res.status(200).json({ success: true, data: feedbacksWithDetails });

  } catch (error) {
    console.error("Eroare la preluarea feedbackurilor:", error);
    res.status(500).json({ message: "Eroare la preluarea feedbackurilor pacientului." });
  }
};

export default getPatientFeedbackByID;
