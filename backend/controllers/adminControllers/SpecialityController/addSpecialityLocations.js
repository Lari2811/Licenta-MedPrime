import specialityLocationModel from "../../../models/specialityLocationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import logAction from '../../../utils/logAction.js';
import { io } from '../../../server.js';

export const addSpecialityLocations = async (req, res) => {
  try {
    const { adminID, specialityID, specialityName, selectedLocations } = req.body;
    

    if (!specialityID || !selectedLocations || !adminID) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }

    let parsedSelectedLocations = selectedLocations;
    if (typeof selectedLocations === 'string') {
      parsedSelectedLocations = JSON.parse(selectedLocations);
    }

    console.log("SpecLoc:", parsedSelectedLocations)

    if (!Array.isArray(parsedSelectedLocations) || parsedSelectedLocations.length === 0) {
      return res.status(400).json({ message: "Trebuie trimisă o listă validă de locații!" });
    }

    const locationsToInsert = parsedSelectedLocations.map(loc => ({
      specialityID,
      locationID: loc.locationID,
      isSpecialityActive: loc.isSpecialityActive,
    }));

    const locationResults = await specialityLocationModel.insertMany(locationsToInsert);

    await specialityModel.findOneAndUpdate(
      { specialityID },
      { isSpecialitySetupCompleted: true },
      { new: true }
    );

    await logAction({
      actionType: 'ADD_SPECIALITY_LOCATIONS',
      description: `Adminul ${adminID} a adăugat ${locationResults.length} locații pentru specialitatea ${specialityID}.`,
      userId: adminID,
      userRole: 'admin',
      ipAddress: req.ip,
      details: {
        specialityID,
        specialityName,
        locations: locationResults.map(loc => ({
          locationID: loc.locationID,
          isSpecialityActive: loc.isSpecialityActive
        })),
      },
    });

    io.emit('specialityLocationsUpdated', {
      message: `Locațiile pentru specialitatea ${specialityID} au fost actualizate!`,
      specialityID,
      locations: locationResults
    });

    res.status(201).json({
      message: "Locațiile specialității au fost salvate cu succes!",
      specialityID,
      locations: locationResults
    });

  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la adăugarea locațiilor specialități!" });
  }
};
