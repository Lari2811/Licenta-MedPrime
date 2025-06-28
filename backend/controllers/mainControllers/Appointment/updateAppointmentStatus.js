import appointmentModel from "../../../models/appointmentModel.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentID, newStatus } = req.body;

    if (!appointmentID || !newStatus ) {
      return res.status(400).json({ error: "Toate câmpurile sunt obligatorii." });
    }

    const appointment = await appointmentModel.findOne({ appointmentID });

    if (!appointment) {
      return res.status(404).json({ error: "Programarea nu a fost găsită." });
    }

    const oldStatus = appointment.status;

    // Actualizăm statusul
    appointment.status = newStatus;
    await appointment.save();

    io.emit("appointmentUpdated", {
      appointmentID,
      oldStatus,
      newStatus,
      patientID: appointment.patientID,
      doctorID: appointment.doctorID 
    });

    await logAction({
        actionType: "UPDATE_APPOINTMENT_STATUS",
        description: `${appointment.doctorID} a schimbat statusul programării (${appointmentID}) la "${newStatus}".`,
        userId: "DR",
        userRole: "doctor",
        ipAddress: req.ip,
        details: {
            appointmentID,
            oldStatus: appointment.status,
            newStatus,
            locationID: appointment.locationID,
            doctorID: appointment.doctorID,
            investigationID: appointment.investigationID,
            specialityID: appointment.specialityID,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime
        }
    });

    res.status(200).json({
      message: `Statusul programării a fost actualizat la "${newStatus}".`,
      appointment,
    });
  } catch (error) {
    console.error("Eroare la actualizarea statusului:", error);
    res.status(500).json({ error: "A apărut o eroare la actualizarea statusului." });
  }
};
