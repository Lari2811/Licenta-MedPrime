import doctorModel from "../../models/doctorModel.js";
import doctorProfileModel from "../../models/doctorProfileModel.js";
import doctorLocationModel from "../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../models/doctorspecialities.js";
import specialityModel from "../../models/specialityModel.js"; // pentru nume specialități
import locationModel from "../../models/locationModel.js"; // opțional

export const getDoctorFullDetails = async (req, res) => {
  const { doctorID } = req.params;

  try {
    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) return res.status(404).json({ message: "Doctor inexistent" });

    const profile = await doctorProfileModel.findOne({ doctorID });

    const specialties = await doctorSpecialitiesModel.find({ doctorID });
    const specialityIDs = specialties.map(s => s.specialityID);

    const specialityDocs = await specialityModel.find({ specialityID: { $in: specialityIDs } });
    const specialityMap = {};
    specialityDocs.forEach(spec => {
      specialityMap[spec.specialityID] = spec.name;
    });

    const locationData = await doctorLocationModel.find({ doctorID });

    const locationIDs = locationData.map(loc => loc.locationID);
    const locationDocs = await locationModel.find({ locationID: { $in: locationIDs } });
    const locationMap = {};
    locationDocs.forEach(loc => {
      locationMap[loc.locationID] = loc.clinicName;
    });

    const formattedSpecialties = specialties.map(s => ({
      id: s.specialityID,
      name: specialityMap[s.specialityID] || null
    }));

    const formattedLocations = locationData.map(l => ({
      locationID: l.locationID,
      locationName: locationMap[l.locationID] || null,
      specialityID: l.specialityID,
      specialityName: specialityMap[l.specialityID] || null,
      schedule: l.schedule
    }));

    res.status(200).json({
      success: true,
      doctor,
      profile: profile || {},
      specialities: formattedSpecialties,
      locations: formattedLocations
    });
  } catch (error) {
    console.error("Eroare getDoctorFullDetails:", error);
    res.status(500).json({ message: "Eroare server la preluare doctor" });
  }
};
