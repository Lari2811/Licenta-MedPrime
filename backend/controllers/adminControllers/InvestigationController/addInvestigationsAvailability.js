import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";
import investigationModel from "../../../models/investigationModel.js";

export const addInvestigationAvailability = async (req, res) => {
  try {
    const { adminID, finalPayload } = req.body;

    if (!adminID || !finalPayload || !finalPayload.investigationID) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }


    const { investigationID, specialities } = finalPayload;

    const toSave = [];

    specialities.forEach((spec) => {
      spec.locations.forEach((loc) => {
        toSave.push({
            investigationID,
            specialityID: spec.specialityID,
            locationID: loc.locationID,

            isInvestigationActive: loc.isInvestigationActive || false,
            price: loc.price,
            currency: "RON"
        });
      });
    });

    const saved = await investigationAvailabilityModel.insertMany(toSave);

    const uniquePairs = new Set();
      specialities.forEach((spec) => {
        uniquePairs.add(`${investigationID}-${spec.specialityID}`);
      });

    // Transformă în array de obiecte pentru salvare
    const toSave_INV_SPEC = Array.from(uniquePairs).map((pair) => {
      const [invID, specID] = pair.split('-');
      return {
        investigationID: invID,
        specialityID: specID
      };
    });

    const existingRelations = await investigationSpecialityModel.find({
      investigationID,
      specialityID: { $in: toSave_INV_SPEC.map(rel => rel.specialityID) }
    });

    const existingSet = new Set(existingRelations.map(rel => `${rel.investigationID}-${rel.specialityID}`));

    const filteredToSave = toSave_INV_SPEC.filter(rel => !existingSet.has(`${rel.investigationID}-${rel.specialityID}`));

    if (filteredToSave.length > 0) {
      await investigationSpecialityModel.insertMany(filteredToSave);
      console.log(`Adăugat ${filteredToSave.length} relații noi în tabela investigationSpecialities.`);
    } else {
      console.log("Nu au fost relații noi de adăugat în tabela investigationSpecialities.");
    }

    await investigationModel.findOneAndUpdate(
      { investigationID },
      { isInvestigationSetupCompleted: true },
      { new: true }
    );


    await logAction({
      actionType: 'ADD_INVESTIGATION_AVAILABILITY',
      description: `Adminul ${adminID} a adaugat disponibilitatea pentru investigația ${investigationID}.`,
      userId: adminID,
      userRole: 'admin',
      ipAddress: req.ip,
      details: {
        investigationID,
        totalEntries: saved.length,
      },
    });

    io.emit('investigationAvailabilityAdded', {
      message: `Disponibilitatea pentru investigația ${investigationID} a fost actualizată!`,
      investigationID,
      totalEntries: saved.length,
    });

    res.status(201).json({
      message: "Disponibilitatea investigației a fost salvată cu succes!",
      investigationID,
      savedCount: saved.length,
    });

  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la salvarea disponibilității investigației!" });
  }
};