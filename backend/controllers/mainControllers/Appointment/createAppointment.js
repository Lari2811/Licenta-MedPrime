import appointmentModel from "../../../models/appointmentModel.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";

const generateAppointmentID = async () => {
  const lastAppointment = await appointmentModel
    .findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!lastAppointment || !lastAppointment.appointmentID) {
    return 'AP001';
  }

  const lastNumber = parseInt(lastAppointment.appointmentID.replace('AP', ''), 10) || 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `AP${newNumber}`;
};

export const createAppointment = async (req, res) => {

    console.log("Am primit datele: ", req.body)
  try {
    const { patientID, doctorID, investigationID, locationID, specialityID, 
        date, startTime, endTime, notes  } = req.body;

    if (!patientID || !doctorID || !investigationID || !locationID || !specialityID || !startTime || !endTime ) {
      return res.status(400).json({ message: "Toate câmpurile sunt obligatorii!" });
    }

    const newAppointmentID = await generateAppointmentID();

    const newAppointment = await appointmentModel.create({
      appointmentID: newAppointmentID,
      patientID,
      doctorID,
      investigationID,
      specialityID,
      locationID,
      date,
      startTime,
      endTime, 
      notes,
      status: "in asteptare", 
    });

    await logAction({
      actionType: "CREATE_APPOINTMENT",
      description: `Pacientul ${patientID} a creat o programare (${newAppointmentID}) la medicul ${doctorID} pentru investigația ${investigationID}.`,
      userId: patientID,
      userRole: 'patient',
      ipAddress: req.ip,
      details: {
        appointmentID: newAppointmentID,
        date,
        startTime,
        endTime,
        locationID,
        doctorID,
        investigationID,
        specialityID
      },
    });

    io.emit('appointmentAdded', {
      message: `A fost adăugată o nouă programare (${newAppointmentID})`,
      appointmentID: newAppointmentID,
      appointment: newAppointment,
    });

    res.status(201).json({
      success: true,
      message: "Programarea a fost creată cu succes!",
      appointmentID: newAppointmentID,
      appointment: newAppointment,
    });

  } catch (error) {
    console.error("Eroare la crearea programării:", error);
    res.status(500).json({ message: "Eroare la crearea programării!" });
  }
};

