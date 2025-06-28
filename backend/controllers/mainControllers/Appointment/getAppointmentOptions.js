import investigationModel from "../../../models/investigationModel.js";
import doctorModel from "../../../models/doctorModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import locationModel from "../../../models/locationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";

export const getAppointmentOptions = async (req, res) => {
  try {
    const { investigationID, doctorID, specialityID } = req.query;

    const response = {
      validDoctors: [],
      validSpecialities: [],
      validLocations: [],
    };

    // Doar investigationID - returnam specialitatile
    if (investigationID && !specialityID && !doctorID) {
      const links = await investigationSpecialityModel.find({ investigationID });
      const specialityIDs = links.map(link => link.specialityID);

      const specialities = await specialityModel.find({
        specialityID: { $in: specialityIDs }
      });

      response.validSpecialities = specialities;
    }

    // Investigation + Specialitate - returnam doctorii din specialitate
    if (investigationID && specialityID && !doctorID) {
      const doctorLinks = await doctorSpecialitiesModel.find({ specialityID });
      const doctorIDs = [...new Set(doctorLinks.map(link => link.doctorID))];

      const doctors = await doctorModel.find({
        doctorID: { $in: doctorIDs },
        //status: "activ"
      });

      const doctorLocationLinks = await doctorLocationModel.find({ doctorID: { $in: doctorIDs } });
      const doctorsWithLocations = doctors.map(doc => {
        const locatii = doctorLocationLinks
          .filter(link => link.doctorID === doc.doctorID)
          .map(link => ({
            locationID: link.locationID,
            specialityID: link.specialityID
          }));

        return {
          ...doc._doc,
          locations: locatii
        };
      });

      response.validDoctors = doctorsWithLocations;
    }

    // Investigation + Specialitate + Doctor - returnam locatiile
    if (investigationID && specialityID && doctorID) {
      const locatiiDoctor = await doctorLocationModel.find({ doctorID, specialityID });
      const locationIDs = locatiiDoctor.map(loc => loc.locationID);

      const availabilities = await investigationAvailabilityModel.find({
        investigationID,
        locationID: { $in: locationIDs },
        isInvestigationActive: true
      });

      const finalLocationIDs = [...new Set(availabilities.map(av => av.locationID))];
      const locations = await locationModel.find({
        locationID: { $in: finalLocationIDs },
        isLocationActive: true
      });

      response.validLocations = locations;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("Eroare getAppointmentOptions:", err);
    res.status(500).json({ error: "Eroare server la obținere opțiuni programare." });
  }
};
