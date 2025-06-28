import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import locationModel from "../../../models/locationModel.js";
import specialityModel from "../../../models/specialityModel.js";

export const getInvestigationDetailsTable = async (req, res) => {
  try {
    const availability = await investigationAvailabilityModel.find().lean();
    const allLocations = await locationModel.find().lean();
    const allSpecialities = await specialityModel.find().lean();

    const result = {};

    availability.forEach(entry => {
      const location = allLocations.find(loc => loc.locationID === entry.locationID);
      const speciality = allSpecialities.find(spec => spec.specialityID === entry.specialityID);

      const locationName = location?.clinicName || '';
      const county = location?.address?.county || '';
      const specialityName = speciality?.name || '';

      const record = {
        specialityID: entry.specialityID,
        specialityName,
        locationID: entry.locationID,
        clinicName: locationName,
        county,
        price: entry.price,
        isActive: entry.isActive,
      };

      if (!result[entry.investigationID]) result[entry.investigationID] = [];
      result[entry.investigationID].push(record);
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(" Eroare la extragerea detaliilor investigației:", err);
    res.status(500).json({
      success: false,
      message: "Eroare server la investigatie-details.",
    });
  }
};
