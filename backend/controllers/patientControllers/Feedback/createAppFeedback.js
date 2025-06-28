import patientFeedbackModel from "../../../models/patientFeedbackModel.js";
import doctorModel from "../../../models/doctorModel.js";
import appointmentModel from "../../../models/appointmentModel.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";

const generateFeedbackID = async () => {
  const lastFeedback = await patientFeedbackModel
    .findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!lastFeedback || !lastFeedback.patientFeedbackID) {
    return 'PF001';
  }

  const lastNumber = parseInt(lastFeedback.patientFeedbackID.replace('PF', ''), 10) || 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `PF${newNumber}`;
};

const createAppFeedback = async (req, res) => {
  try {
    const { appointmentID, patientID, doctorID, rating, comment } = req.body;

    // Verifica dacă deja există feedback pentru acea programare
    const existing = await patientFeedbackModel.findOne({ appointmentID });
    if (existing) {
      return res.status(409).json({ message: "Feedbackul a fost deja trimis pentru această programare." });
    }

    const patientFeedbackID = await generateFeedbackID();

    const newFeedback = await patientFeedbackModel.create({
      patientFeedbackID,
      appointmentID,
      patientID,
      doctorID,
      rating,
      comment,
    });

    //  Actualizare status în appointment 
    await appointmentModel.findOneAndUpdate(
      { appointmentID },
      { patientFeedbackGiven: true }
    );

    //  Actualizam ratingul medicului
    const doctor = await doctorModel.findOne({ doctorID });
      if (!doctor) {
        return res.status(404).json({ message: "Medicul nu a fost găsit." });
      }

    console.log("Doctor gasit")

    const oldRating = doctor.rating || 0;
    const oldCount = doctor.ratingCount || 0;
    const newCount = oldCount + 1;

    const updatedRating = ((oldRating * oldCount) + rating) / newCount;

    console.log("Update: ", oldRating, oldCount, newCount, updatedRating,)

    await doctorModel.findOneAndUpdate(
      { doctorID },
      {
        rating: updatedRating.toFixed(2),
        ratingCount: newCount
      }
    );

    console.log("dupa doctor")
    
    await logAction({
      actionType: "feedback_add",
      description: `Feedback trimis de pacient ${patientID} pentru programarea ${appointmentID}`,
      userId: patientID,
      userRole: "patient",
      ipAddress: req.ip,
      details: {
        rating,
        comment,
      }
    });

    io.emit("FEEDBACK_ADDED", {
      feedbackID: patientFeedbackID,
      appointmentID,
      doctorID,
      patientID,
      rating,
      comment
    });

    res.status(201).json({ message: "Feedback trimis cu succes!", data: newFeedback });
  } catch (error) {
    console.error("Eroare feedback:", error);
    res.status(500).json({ message: "Eroare la trimiterea feedbackului." });
  }
}

export {
  createAppFeedback
}