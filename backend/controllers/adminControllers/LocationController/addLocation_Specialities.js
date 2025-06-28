import specialityLocationModel from "../../../models/specialityLocationModel.js";
import logAction from '../../../utils/logAction.js';
import { io } from '../../../server.js';
import locationModel from "../../../models/locationModel.js";

export const addLocation_Specialities = async (req, res) => {
  try {
    const { adminID, locationID, clinicName, selectedSpecialities } = req.body;

    if (!locationID || !selectedSpecialities || !adminID) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }

    let parsedSelectedSpecialities = selectedSpecialities;
    if (typeof selectedSpecialities === 'string') {
      parsedSelectedSpecialities = JSON.parse(selectedSpecialities);
    }


    if (!Array.isArray(parsedSelectedSpecialities) || parsedSelectedSpecialities.length === 0) {
      return res.status(400).json({ message: "Trebuie trimisă o listă validă de specialități!" });
    }

    const specialitiesToInsert = parsedSelectedSpecialities.map(spec => ({
      locationID,
      specialityID: spec.specialityID,
      isSpecialityActive: spec.isSpecialityActive,
    }));

    const insertedSpecialities = await specialityLocationModel.insertMany(specialitiesToInsert);

    await locationModel.findOneAndUpdate(
      { locationID },
      { isLocationSetupCompleted: true },
      { new: true }
    );


    await logAction({
      actionType: 'ADD_LOCATION_SPECIALITIES',
      description: `Adminul ${adminID} a adăugat ${insertedSpecialities.length} specialități pentru locația ${locationID}.`,
      userId: adminID,
      userRole: 'admin',
      ipAddress: req.ip,
      details: {
        locationID,
        clinicName,
        specialities: insertedSpecialities.map(spec => ({
          specialityID: spec.specialityID,
          isSpecialityActive: spec.isSpecialityActive,
        })),
      },
    });

    io.emit('locationSpecialitiesUpdated', {
      message: `Specialitățile pentru locația ${locationID} au fost actualizate!`,
      locationID,
      specialities: insertedSpecialities,
    });

    res.status(201).json({
      message: "Specialitățile pentru locație au fost salvate cu succes!",
      locationID,
      specialities: insertedSpecialities,
    });

  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la adăugarea specialităților pentru locație!" });
  }
};
