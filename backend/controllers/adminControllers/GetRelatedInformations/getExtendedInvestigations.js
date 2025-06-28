import investigationModel from "../../../models/investigationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";

import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import specialityModel from "../../../models/specialityModel.js";
import locationModel from "../../../models/locationModel.js";

export const getExtendedInvestigations = async (req, res) => {
  try {
    const investigations = await investigationModel.find();

    const allSpecialities = await specialityModel.find().select('specialityID name');

    const allLocations = await locationModel.find().select('locationID clinicName');

    const extendedInvestigations = await Promise.all(investigations.map(async (inv) => {
      const invSpecialitiesLinks = await investigationSpecialityModel.find({ investigationID: inv.investigationID });
      
      const specialities = invSpecialitiesLinks.map(link => {
        const found = allSpecialities.find(s => s.specialityID === link.specialityID);
        return found ? { specialityID: found.specialityID, name: found.name } : null;
      }).filter(Boolean);

      const invLocationsLinks = await investigationAvailabilityModel.find({
        investigationID: inv.investigationID,
        isInvestigationActive: true
      }).select('locationID specialityID');

      const locations = invLocationsLinks.map(link => {
        const foundLoc = allLocations.find(l => l.locationID === link.locationID);
        return foundLoc ? {
          locationID: foundLoc.locationID,
          clinicName: foundLoc.clinicName,
          specialityID: link.specialityID
        } : null;
      }).filter(Boolean);

      return {
        ...inv._doc,
        specialities,
        locations
      };
    }));

    res.status(200).json({ success: true, data: extendedInvestigations });

  } catch (err) {
    console.error("Eroare getExtendedInvestigations:", err);
    res.status(500).json({ success: false, message: 'Eroare la obținerea investigațiilor extinse' });
  }
};
