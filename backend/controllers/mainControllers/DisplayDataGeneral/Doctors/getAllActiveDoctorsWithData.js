import doctorModel from "../../../../models/doctorModel.js";
import doctorProfileModel from "../../../../models/doctorProfileModel.js";
import doctorLocationModel from "../../../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../../../models/doctorspecialities.js";
import specialityModel from "../../../../models/specialityModel.js";
import locationModel from "../../../../models/locationModel.js";


export const getAllActiveDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({
        status: { $nin: ["blocat", "suspendat"] }
        });
    const doctorIDs = doctors.map(doc => doc.doctorID);

    const [profiles, specialties, locations] = await Promise.all([
      doctorProfileModel.find({ doctorID: { $in: doctorIDs } }),
      doctorSpecialitiesModel.find({ doctorID: { $in: doctorIDs } }),
      doctorLocationModel.find({ doctorID: { $in: doctorIDs } })
    ]);

    const specialityIDs = [...new Set(specialties.map(s => s.specialityID))];
    const locationIDs = [...new Set(locations.map(l => l.locationID))];

    const [specialityDocs, locationDocs] = await Promise.all([
      specialityModel.find({ specialityID: { $in: specialityIDs } }),
      locationModel.find({ locationID: { $in: locationIDs } })
    ]);


    const specialityMap = {};
    specialityDocs.forEach(s => {
      specialityMap[s.specialityID] = s.name;
    });

    const locationMap = {};
    locationDocs.forEach(l => {
      locationMap[l.locationID] = {
        name: l.clinicName,
        address: l.address
      };
    });


  const response = doctors.map(doc => {
    const profile = profiles.find(p => p.doctorID === doc.doctorID) || {};

    const docSpecialities = specialties
        .filter(s => s.doctorID === doc.doctorID)
        .map(s => ({
        specialityID: s.specialityID,
        specialityName: specialityMap[s.specialityID] || null
        }));

    const docLocations = locations
        .filter(l => l.doctorID === doc.doctorID)
        .map(l => ({
        locationID: l.locationID,
        locationName: locationMap[l.locationID]?.name || null,
        address: locationMap[l.locationID]?.address || null,
        specialityID: l.specialityID,
        specialityName: specialityMap[l.specialityID] || null,
        schedule: l.schedule
        }));

    const result = {
        ...doc.toObject(),
        profile,
        specialities: docSpecialities,
        locations: docLocations
    };

    return result;
    });


    res.status(200).json({ data: response });

  } catch (err) {
    console.error("Eroare getAllActiveDoctors:", err);
    res.status(500).json({ message: "Eroare la obținerea doctorilor activi" });
  }
};
