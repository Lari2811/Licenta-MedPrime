import doctorModel from '../../../models/doctorModel.js';
import appointmentModel from "../../../models/appointmentModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import locationModel from "../../../models/locationModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";
import specialityModel from "../../../models/specialityModel.js";

import doctorProfileModel from "../../../models/doctorProfileModel.js";
import patientFeedbackModel from "../../../models/patientFeedbackModel.js";
import userModel from '../../../models/userModel.js';
import medicalSheetModel from '../../../models/medicalSheet.js';

import cloudinary from '../../../utils/cloudinary.js';

import { io } from '../../../server.js';

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary') || !url.includes('/upload/')) return null;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return null;
  const publicIdWithExt = parts[1]; 
  const publicId = publicIdWithExt.split('.')[0]; 
  return publicId; 
};

const getDoctorInfoSummary = async (req, res) => {
  const { doctorID } = req.body;

  try {
    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) return res.status(404).json({ message: "Medicul nu a fost găsit." });

    const activeAppointmentsCount = await appointmentModel.countDocuments({
      doctorID,
      status: { $ne: "Anulată" }
    });

    const doctorLocations = await doctorLocationModel.find({ doctorID });
    const locationIDs = doctorLocations.map(dl => dl.locationID);
    const locations = await locationModel.find({ locationID: { $in: locationIDs } });

    const locationInfo = locations.map(loc => ({
      locationID: loc.locationID,
      clinicName: loc.clinicName
    }));

    const doctorSpecialities = await doctorSpecialitiesModel.find({ doctorID });
    const specialityIDs = doctorSpecialities.map(ds => ds.specialityID);
    const specialities = await specialityModel.find({ specialityID: { $in: specialityIDs } });

    const specialityInfo = specialities.map(spec => ({
      specialityID: spec.specialityID,
      specialityName: spec.name
    }));

    return res.json({
      doctor: {
        doctorID,
        fullName: `${doctor.lastName} ${doctor.firstName}`,
        email: doctor.email,
      },
      activeAppointmentsCount,
      locations: locationInfo,
      specialities: specialityInfo
    });

  } catch (err) {
    console.error("Eroare la getDoctorInfoSummary:", err);
    res.status(500).json({ message: "Eroare la preluarea datelor medicului." });
  }
};

const deleteDoctorAndCancelAppointments = async (req, res) => {
  const { doctorID } = req.params;

  try {
    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) {
      return res.status(404).json({ message: "Medicul nu a fost găsit." });
    }

    const fullDoctorName = `${doctor.lastName} ${doctor.firstName} [șters]`.trim();

    const profilePublicId = getPublicIdFromUrl(doctor.profileImage);
    if (profilePublicId) {
        await cloudinary.uploader.destroy(profilePublicId);
        console.log(`Imaginea ${profilePublicId} a fost ștearsă din Cloudinary.`);
    } else {
        console.log(" Nu există imagine de profil de șters.");
    }

    //  Anulare programri active
    const updatedAppointments = await appointmentModel.updateMany(
        {
            doctorID,
            status: { $in: ["in asteptare", "confirmata", "in desfasurare"] }
        },
        {
            $set: {
            status: "anulata",
            canceledReason: "Medicul nu mai face parte din echipa noastră",
            canceledBy: "administrator",
            doctorID: fullDoctorName
            }
        }
    );

    const updatedSheets = await medicalSheetModel.updateMany(
      { appointmentID: { $in: appointmentIDs } },
      {
        $set: {
          doctorID: fullDoctorName
        }
      }
    );


    // sterge din colectiile asociate
    await doctorProfileModel.deleteOne({ doctorID });
    await doctorModel.deleteOne({ doctorID });
    await doctorLocationModel.deleteMany({ doctorID });
    await doctorSpecialitiesModel.deleteMany({ doctorID });
    await patientFeedbackModel.deleteMany({ doctorID });
    await userModel.deleteOne({ linkedID: doctorID });

    io.emit('DOCTOR_DELETED', {
        message: `Medic ${doctorID} a fost sters!`,
        doctorID: doctorID,

    });

    return res.status(200).json({
        success: true,
        message: "Medicul a fost șters cu succes.",
        appointmentsUpdated: updatedAppointments.modifiedCount
    });

  } catch (err) {
    console.error("Eroare la ștergerea medicului:", err);
    res.status(500).json({ message: "A apărut o eroare la ștergerea medicului." });
  }

  io.emit('locationAdded', {
  message: `Locația ${locationID} a fost adăugată!`,
  locationID: locationID,
  location: newLocation,
});


};

export {
  getDoctorInfoSummary,
  deleteDoctorAndCancelAppointments
};
