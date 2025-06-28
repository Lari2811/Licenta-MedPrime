import specialityLocationModel from "../../../models/specialityLocationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import locationModel from "../../../models/locationModel.js";


const getActiveSpecialitiesWithLocations = async (req, res) => {
  try {
    const mappings = await specialityLocationModel.find({ isSpecialityActive: true }).lean();

    const specialityIDs = [...new Set(mappings.map(m => m.specialityID))];
    const locationIDs = [...new Set(mappings.map(m => m.locationID))];

    const specialities = await specialityModel.find({ specialityID: { $in: specialityIDs } }).lean();
    const locations = await locationModel.find({ locationID: { $in: locationIDs } }).lean();

    const finalResult = mappings.map(m => {
      const speciality = specialities.find(s => s.specialityID === m.specialityID);
      const location = locations.find(l => l.locationID === m.locationID);

      return {
        specialityID: m.specialityID,
        specialityName: speciality?.name || "Necunoscută",
        locationInfo: location || {},
      };
    });

    return res.status(200).json({ success: true, data: finalResult });

  } catch (error) {
    console.error("Eroare la fetch specialități-locații:", error);
    return res.status(500).json({ message: "Eroare server." });
  }
};

export{
    getActiveSpecialitiesWithLocations
}
