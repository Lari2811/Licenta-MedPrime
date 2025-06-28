import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import investigationModel from "../../../models/investigationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";
import appointmentModel from "../../../models/appointmentModel.js";

import { io } from "../../../server.js";

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const splitPart = url.split("/upload/")[1];
    if (!splitPart) return null;
    const withoutVersion = splitPart.split("/").slice(1).join("/");
    return withoutVersion.replace(/\.[^/.]+$/, "");
};


const getInvestigationInfoSummary = async (req, res) => {
  const { investigationID } = req.body;

  try {
    const investigation = await investigationModel.findOne({ investigationID });
    if (!investigation) {
      return res.status(404).json({ message: "Investigația nu a fost găsită." });
    }

    // Programari active 
    const activeAppointmentsCount = await appointmentModel.countDocuments({
      investigationID,
      status: { $in: ["in asteptare", "confirmata", "in desfasurare"] },
    });

    // Locatiile asociate
    const availabilityDocs = await investigationAvailabilityModel.find({ investigationID });

    const totalLocations = new Set(availabilityDocs.map(doc => doc.locationID));
    const activeLocations = new Set(
      availabilityDocs.filter(doc => doc.isInvestigationActive).map(doc => doc.locationID)
    );
    const inactiveLocations = new Set(
      availabilityDocs.filter(doc => !doc.isInvestigationActive).map(doc => doc.locationID)
    );

    //  Specialitati asociate
    const specialityDocs = await investigationSpecialityModel.find({ investigationID });
    const totalSpecialities = new Set(specialityDocs.map(doc => doc.specialityID));

    return res.status(200).json({
      investigation: {
        investigationID,
        name: investigation.name,
      },
      activeAppointmentsCount,
      locationsCount: {
        total: totalLocations.size,
        active: activeLocations.size,
        inactive: inactiveLocations.size,
      },
      specialitiesCount: totalSpecialities.size,
    });
  } catch (err) {
    console.error("Eroare getInvestigationInfoSummary:", err);
    return res.status(500).json({ message: "Eroare la preluarea detaliilor investigației." });
  }
};

const deleteInvestigationAndCancelAppointments = async (req, res) => {
  const { investigationID } = req.params;

  try {
    const investigation = await investigationModel.findOne({ investigationID });
    if (!investigation) {
      return res.status(404).json({ message: "Investigația nu a fost găsită." });
    }

    const fullInvestigationName = `${investigation.name} [ștearsă]`.trim();

    // sterge imagine 
    const profilePublicId = getPublicIdFromUrl(investigation.profileImage);
    if (profilePublicId) {
      await cloudinary.uploader.destroy(profilePublicId);
      console.log(`Imaginea ${profilePublicId} a fost ștearsă.`);
    } else {
      console.log("Nu există imagine de șters.");
    }

    // Anulare programări
    const updatedAppointments = await appointmentModel.updateMany(
      {
        investigationID,
        status: { $in: ["in asteptare", "confirmata", "in desfasurare"] }
      },
      {
        $set: {
          status: "anulata",
          canceledReason: "Investigația nu mai este disponibilă",
          canceledBy: "administrator",
          investigationID: fullInvestigationName
        }
      }
    );

    // Stergere colectii asocaite
    await investigationAvailabilityModel.deleteMany({ investigationID });
    await investigationSpecialityModel.deleteMany({ investigationID });
    await investigationModel.deleteOne({ investigationID });

    io.emit("INVESTIGATION_DELETED", {
      message: `Investigația ${investigationID} a fost ștearsă.`,
      investigationID
    });

    return res.status(200).json({
      success: true,
      message: "Investigația a fost ștearsă cu succes.",
      appointmentsUpdated: updatedAppointments.modifiedCount
    });

  } catch (err) {
    console.error("Eroare la ștergerea investigației:", err);
    return res.status(500).json({ message: "Eroare la ștergerea investigației." });
  }
};

export {
    getInvestigationInfoSummary,
    deleteInvestigationAndCancelAppointments
}
