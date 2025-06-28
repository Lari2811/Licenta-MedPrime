import locationModel from "../../../models/locationModel.js";
import appointmentModel from "../../../models/appointmentModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import specialityLocationModel from "../../../models/specialityLocationModel.js";

import { io } from '../../../server.js';

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const splitPart = url.split("/upload/")[1];
    if (!splitPart) return null;
    const withoutVersion = splitPart.split("/").slice(1).join("/");
    return withoutVersion.replace(/\.[^/.]+$/, "");
};

const getLocationInfoSummary = async (req, res) => {
  const { locationID } = req.body;

  try {
    const location = await locationModel.findOne({ locationID });
    if (!location) {
      return res.status(404).json({ message: "Locația nu a fost găsită." });
    }

    const activeAppointmentsCount = await appointmentModel.countDocuments({
      locationID,
      status: { $in: ["in asteptare", "confirmata", "in desfasurare"] },
    });

    const associatedDoctors = await doctorLocationModel.find({ locationID });

    const specialitiesCount = await specialityLocationModel.countDocuments({
      locationID,
    });

    const activeSpecialitiesCount = await specialityLocationModel.countDocuments({
        locationID,
        isSpecialityActive: true,
    });

    const inactiveSpecialitiesCount = await specialityLocationModel.countDocuments({
        locationID,
        isSpecialityActive: false,
    });
   

    const investigationsCount = await investigationAvailabilityModel.countDocuments({
      locationID,
    });

    const activeInvestigationsCount = await investigationAvailabilityModel.countDocuments({
        locationID,
        isInvestigationActive: true,
    });

    const inactiveInvestigationsCount = await investigationAvailabilityModel.countDocuments({
        locationID,
        isInvestigationActive: false,
    });


    return res.status(200).json({
      location: {
        locationID,
        clinicName: location.clinicName,
        address: location.address,
      },
      activeAppointmentsCount,
      specialitiesCount,
      activeSpecialitiesCount,
      inactiveSpecialitiesCount,
      investigationsCount,
      activeInvestigationsCount,
      inactiveInvestigationsCount,
      associatedDoctors: associatedDoctors.map((doc) => ({
        doctorID: doc.doctorID,
      })),
    });
  } catch (err) {
    console.error("Eroare getLocationInfoSummary:", err);
    return res.status(500).json({ message: "Eroare la preluarea detaliilor locației." });
  }
};

const deleteLocationAndCancelAppointments = async (req, res) => {
  const { locationID } = req.params;

  try {
    const location = await locationModel.findOne({ locationID });
    if (!location) {
      return res.status(404).json({ message: "Locația nu a fost găsită." });
    }

    const fullLocationName = `${location.clinicName} [ștersă]`;

    const profilePublicId = getPublicIdFromUrl(location.images?.profileImage);
    const galleryPublicIds = (location.images?.gallery || [])
      .map(getPublicIdFromUrl)
      .filter(Boolean);

    if (profilePublicId) {
      await cloudinary.uploader.destroy(profilePublicId);
      console.log(`Imaginea de profil ${profilePublicId} ștearsă.`);
    }

    if (galleryPublicIds.length > 0) {
      const deletePromises = galleryPublicIds.map(pid => cloudinary.uploader.destroy(pid));
      await Promise.all(deletePromises);
      console.log(`${galleryPublicIds.length} imagini din galerie au fost șterse.`);
    }

    // Anulare programari active 
    const updatedAppointments = await appointmentModel.updateMany(
      {
        locationID,
        status: { $in: ["in asteptare", "confirmata", "in desfasurare"] }
      },
      {
        $set: {
          status: "anulata",
          canceledReason: "Locația a fost dezactivată",
          canceledBy: "administrator",
          locationID: fullLocationName
        }
      }
    );

    // Sterge date asociate
    await doctorLocationModel.deleteMany({ locationID });
    await investigationAvailabilityModel.deleteMany({ locationID });
    await specialityLocationModel.deleteMany({ locationID });
    await locationModel.deleteOne({ locationID });

    io.emit("LOCATION_DELETED", {
      message: `Locația ${locationID} a fost ștearsă.`,
      locationID,
    });

    return res.status(200).json({
      success: true,
      message: "Locația a fost ștearsă cu succes.",
      appointmentsUpdated: updatedAppointments.modifiedCount
    });

  } catch (err) {
    console.error("Eroare la ștergerea locației:", err);
    return res.status(500).json({ message: "A apărut o eroare la ștergerea locației." });
  }
};



export {
  getLocationInfoSummary,
  deleteLocationAndCancelAppointments
  
};