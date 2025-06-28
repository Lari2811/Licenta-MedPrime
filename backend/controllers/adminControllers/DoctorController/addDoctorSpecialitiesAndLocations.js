import doctorModel from "../../../models/doctorModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";
import logAction from "../../../utils/logAction.js";
import { io } from "../../../server.js";

export const addDoctorSpecialitiesAndLocations = async (req, res) => {
  try {
    const { adminID, doctorID, schedules } = req.body;

    console.log("Start")

    if (!adminID || !doctorID || !schedules || schedules.length === 0) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }

    await doctorModel.findOneAndUpdate(
      { doctorID },
      { hasSpeciality: true }
    );

    // Extragem lista unica de specialityID din schedules
    const specialityIDs = [...new Set(schedules.map(s => s.specialityID))];

    // verificam ce specialitati exista deja pentru doctor
    const existingSpecs = await doctorSpecialitiesModel.find({
      doctorID,
      specialityID: { $in: specialityIDs }
    });

    const existingSet = new Set(existingSpecs.map(spec => spec.specialityID));

    // pregatim pentru inserare doar specialitatile noi
    const specsToInsert = specialityIDs
      .filter(specID => !existingSet.has(specID))
      .map(specID => ({
        doctorID,
        specialityID: specID
      }));

    if (specsToInsert.length > 0) {
      await doctorSpecialitiesModel.insertMany(specsToInsert);
      console.log(`Adăugat ${specsToInsert.length} specialități noi pentru doctorul ${doctorID}.`);
    }

    // Salvare locatii + programe (doctorLocation)
    const locToInsert = [];

    schedules.forEach(sch => {
    if (sch.locations && Array.isArray(sch.locations)) {
        sch.locations.forEach(loc => {
        locToInsert.push({
            doctorID,
            specialityID: sch.specialityID,
            locationID: loc.locationID,
            schedule: loc.schedule,
        });
        });
    }
    });

    const savedLocations = await doctorLocationModel.insertMany(locToInsert);

    await logAction({
      actionType: 'ADD_DOCTOR_SPECIALITIES_LOCATIONS',
      description: `Adminul ${adminID} a asociat specialități și locații medicului ${doctorID}.`,
      userId: adminID,
      userRole: 'admin',
      ipAddress: req.ip,
      details: {
        doctorID,
        specialitiesCount: specialityIDs.length,
        locationsCount: savedLocations.length
      },
    });

    io.emit('doctorSpecialitiesLocationsUpdated', {
      message: `Specialitățile și locațiile medicului ${doctorID} au fost actualizate!`,
      doctorID,
      specialitiesCount: specialityIDs.length,
      locationsCount: savedLocations.length
    });

    res.status(201).json({
      message: "Specialitățile și locațiile medicului au fost salvate cu succes!",
      doctorID,
      specialitiesCount: specialityIDs.length,
      locationsCount: savedLocations.length
    });

  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la salvarea datelor medicului!" });
  }
};
