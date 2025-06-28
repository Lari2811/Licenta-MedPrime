import appointmentModel from "../../../models/appointmentModel.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentID, cancelReason, canceledBy } = req.body;

    if (!appointmentID || !cancelReason || !canceledBy) {
      return res.status(400).json({ error: "Toate câmpurile sunt obligatorii." });
    }

    const appointment = await appointmentModel.findOne({ appointmentID });

    if (!appointment) {
      return res.status(404).json({ error: "Programarea nu a fost găsită." });
    }

    appointment.status = "anulata";
    appointment.cancelReason = cancelReason;
    appointment.canceledBy = canceledBy;

    await appointment.save();

    io.emit("appointmentUpdated", {
      appointmentID,
      status: "anulată",
      canceledBy,
      cancelReason,
    });

   await logAction({
      actionType: "CANCEL_APPOINTMENT",
      description: `${canceledBy} a anulat programarea (${appointmentID}) motiv: "${cancelReason}".`,
      userId: req.userId || canceledBy,  
      userRole: req.userRole || "admin",  
      ipAddress: req.ip,
      details: {
        appointmentID,
        cancelReason,
        canceledBy,
        previousStatus: appointment.status,
        locationID: appointment.locationID,
        doctorID: appointment.doctorID,
        investigationID: appointment.investigationID,
        specialityID: appointment.specialityID,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      }
    });

    res.status(200).json({ message: "Programarea a fost anulată cu succes.", appointment });
  } catch (error) {
    console.error("Eroare la anulare:", error);
    res.status(500).json({ error: "A apărut o eroare la anularea programării." });
  }
};