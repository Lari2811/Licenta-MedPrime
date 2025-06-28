import specialityLocationModel from "../../../models/specialityLocationModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import investigationModel from "../../../models/investigationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";
import appointmentModel from "../../../models/appointmentModel.js";
import specialityModel from "../../../models/specialityModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";

import { io } from "../../../server.js";

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const splitPart = url.split("/upload/")[1];
    if (!splitPart) return null;
    const withoutVersion = splitPart.split("/").slice(1).join("/");
    return withoutVersion.replace(/\.[^/.]+$/, "");
};

const getSpecialityInfoSummary = async (req, res) => {
  const { specialityID } = req.body;

  try {
    const speciality = await specialityModel.findOne({ specialityID });
    if (!speciality) {
      return res.status(404).json({ message: "Specialitatea nu a fost găsită." });
    }

    // Programari active
    const activeAppointmentsCount = await appointmentModel.countDocuments({
      specialityID,
      status: { $in: ["in asteptare", "confirmata", "in desfasurare"] },
    });

    // Specialitati asociate
    const locationDocs = await specialityLocationModel.find({ specialityID });
    const totalLocations = new Set(locationDocs.map(doc => doc.locationID));
    const activeLocations = new Set(locationDocs.filter(doc => doc.isSpecialityActive).map(doc => doc.locationID));
    const inactiveLocations = new Set(locationDocs.filter(doc => !doc.isSpecialityActive).map(doc => doc.locationID));

    // Investigatii asociate 
    const invSpecDocs = await investigationSpecialityModel.find({ specialityID });
    const totalInvestigations = new Set(invSpecDocs.map(doc => doc.investigationID));

    return res.status(200).json({
      speciality: {
        specialityID,
        name: speciality.name,
      },
      activeAppointmentsCount,
      locationsCount: {
        total: totalLocations.size,
        active: activeLocations.size,
        inactive: inactiveLocations.size,
      },
      investigationsCount: totalInvestigations.size,
    });

  } catch (err) {
    console.error("Eroare getSpecialityInfoSummary:", err);
    return res.status(500).json({ message: "Eroare la preluarea detaliilor specialității." });
  }
};

const deleteSpecialityAndCancelAppointments = async (req, res) => {
  const { specialityID } = req.params;

  console.log("Stergere", specialityID)

  try {
    const speciality = await specialityModel.findOne({ specialityID });
    if (!speciality) {
      return res.status(404).json({ message: "Specialitatea nu a fost găsită." });
    }

    const fullSpecialityName = `${speciality.name} [ștearsă]`.trim();

    // Stergere imagine 
    const profilePublicId = getPublicIdFromUrl(speciality.profileImage);
    if (profilePublicId) {
      await cloudinary.uploader.destroy(profilePublicId);
      console.log(`Imaginea ${profilePublicId} a fost ștearsă.`);
    } else {
      console.log("Nu există imagine de profil de șters.");
    }

    const affectedAppointments = await appointmentModel.find({
      specialityID,
      status: { $in: ["in asteptare", "confirmata", "in desfasurare"] }
    });

    const appointmentIDs = affectedAppointments.map(app => app.appointmentID);

    // Anulare programari
    const updatedAppointments = await appointmentModel.updateMany(
      {
        specialityID,
        status: { $in: ["in asteptare", "confirmata", "in desfasurare"] }
      },
      {
        $set: {
          status: "anulata",
          canceledReason: "Specialitatea nu mai este disponibilă",
          canceledBy: "administrator",
          specialityID: fullSpecialityName
        }
      }
    );

    // Stergere colectii asociate
    await specialityLocationModel.deleteMany({ specialityID });
    await doctorSpecialitiesModel.deleteMany({ specialityID });
    await investigationSpecialityModel.deleteMany({ specialityID });
    await investigationAvailabilityModel.deleteMany({ specialityID });
    await specialityModel.deleteOne({ specialityID });

    io.emit("SPECIALITY_DELETED", {
      message: `Specialitatea ${specialityID} a fost ștearsă.`,
      specialityID
    });

    return res.status(200).json({
      success: true,
      message: "Specialitatea a fost ștearsă cu succes.",
      appointmentsUpdated: updatedAppointments.modifiedCount
    });

  } catch (err) {
    console.error("Eroare la ștergerea specialității:", err);
    return res.status(500).json({ message: "Eroare la ștergerea specialității." });
  }
};

export {
    getSpecialityInfoSummary,
    deleteSpecialityAndCancelAppointments
}