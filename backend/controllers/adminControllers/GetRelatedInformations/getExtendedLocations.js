import locationModel from "../../../models/locationModel.js";
import specialityLocationModel from "../../../models/specialityLocationModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import specialityModel from "../../../models/specialityModel.js";
import investigationModel from "../../../models/investigationModel.js";

export const getExtendedLocations = async (req, res) => {
  try {
    const locations = await locationModel.find();

    const allSpecialities = await specialityModel.find().select('specialityID name');

    const extendedLocations = await Promise.all(locations.map(async (loc) => {
      const activeSpecialitiesLinks = await specialityLocationModel.find({
        locationID: loc.locationID,
        isSpecialityActive: true
      }).select('specialityID -_id');

      const activeSpecialities = activeSpecialitiesLinks.map(link => {
        const found = allSpecialities.find(s => s.specialityID === link.specialityID);
        return found ? { specialityID: found.specialityID, name: found.name } : null;
      }).filter(Boolean);

      return {
        ...loc._doc,
        specialities: activeSpecialities,
      };
    }));

    res.status(200).json({ success: true, data: extendedLocations });

  } catch (err) {
    console.error("Eroare getExtendedLocations:", err);
    res.status(500).json({ success: false, message: 'Eroare la obținerea locațiilor extinse' });
  }
};
