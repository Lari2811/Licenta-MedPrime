import appointmentModel from "../../../models/appointmentModel.js";
import doctorModel from "../../../models/doctorModel.js";
import patientModel from "../../../models/patientModel.js";
import investigationModel from "../../../models/investigationModel.js";
import locationModel from "../../../models/locationModel.js";
import specialityModel from "../../../models/specialityModel.js";

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).sort({ date: -1, startTime: 1 }).lean();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const [doctor, patient, investigation, location, speciality] = await Promise.all([
          appointment.doctorID ? doctorModel.findOne({ doctorID: appointment.doctorID }).lean() : null,
          appointment.patientID ? patientModel.findOne({ patientID: appointment.patientID }).lean() : null,
          appointment.investigationID ? investigationModel.findOne({ investigationID: appointment.investigationID }).lean() : null,
          appointment.locationID ? locationModel.findOne({ locationID: appointment.locationID }).lean() : null,
          appointment.specialityID ? specialityModel.findOne({ specialityID: appointment.specialityID }).lean() : null,
        ]);

        return {
          ...appointment,
          doctorName: doctor ? `${doctor.lastName} ${doctor.firstName}` : null,
          patientName: patient ? `${patient.lastName} ${patient.firstName}` : null,
          investigationName: investigation?.name || null,
          locationName: location?.clinicName || null,
          specialityName: speciality?.name || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedAppointments,
    });

  } catch (err) {
    console.error("Eroare la preluarea programărilor:", err);
    res.status(500).json({
      success: false,
      message: "Eroare server la preluarea programărilor.",
    });
  }
};
