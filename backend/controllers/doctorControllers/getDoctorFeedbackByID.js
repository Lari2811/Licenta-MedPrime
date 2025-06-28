import patientFeedbackModel from "../../models/patientFeedbackModel.js";
import appointmentModel from "../../models/appointmentModel.js";
import investigationModel from "../../models/investigationModel.js";
import patientModel from "../../models/patientModel.js";

// POST /api/feedbacks/doctor
const getDoctorFeedbackByID = async (req, res) => {
  const { doctorID } = req.body;

  if (!doctorID) {
    return res.status(400).json({ message: "Lipsește doctorID." });
  }

  try {
    const feedbacks = await patientFeedbackModel.find({ doctorID }).lean();

    // Toti doctorii 
    const patientIDs  = feedbacks.map(fb => fb.patientID);
    const patients = await patientModel.find({ patientID: { $in: patientIDs } }).lean();

    // Toate appointment-urile
    const appointmentIDs = feedbacks.map(fb => fb.appointmentID);
    const appointments = await appointmentModel.find({ appointmentID: { $in: appointmentIDs } }).lean();

    // Toate investigationID-urile
    const investigationIDs = appointments.map(appt => appt.investigationID);
    const investigations = await investigationModel.find({ investigationID: { $in: investigationIDs } }).lean();

    // Combinam datele
    const feedbacksWithDetails = feedbacks.map(fb => {
      const patient = patients.find(p => p.patientID === fb.patientID);
      const appointment = appointments.find(a => a.appointmentID === fb.appointmentID);
      const investigation = investigations.find(inv => inv.investigationID === appointment?.investigationID);

      return {
        ...fb,
        patientInfo: patient || null,
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

export default getDoctorFeedbackByID;
