import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import investigationModel from "../../../models/investigationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import locationModel from "../../../models/locationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";

const getLocationsByInvestigation = async (req, res) => {
  try {
    const { investigationID } = req.body;

    if (!investigationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește investigationID în body.'
      });
    }

    const entries = await investigationAvailabilityModel.find({ investigationID });

    if (!entries || entries.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există intrări pentru investigationID ${investigationID}.`
      });
    }

    const locationIDs = [...new Set(entries.map(e => e.locationID))];
    const specialityIDs = [...new Set(entries.map(e => e.specialityID))];

    const investigation = await investigationModel.findOne(
      { investigationID },
      { name: 1, duration: 1, _id: 0 }
    );

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: `Nu a fost găsită investigația cu ID-ul ${investigationID}.`
      });
    }

    const locations = await locationModel.find(
      { locationID: { $in: locationIDs } },
      { locationID: 1, clinicName: 1, status: 1, "address.county": 1, _id: 0 }
    );
    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.locationID] = {
        clinicName: loc.clinicName,
        status: loc.status,
        county: loc.address && loc.address.county ? loc.address.county : 'Necunoscut'
      };
    });

    const specialities = await specialityModel.find(
      { specialityID: { $in: specialityIDs } },
      { specialityID: 1, name: 1, _id: 0 }
    );
    const specialityMap = {};
    specialities.forEach(spec => {
      specialityMap[spec.specialityID] = spec.name;
    });

    const result = entries.map(e => ({
      duration: investigation.duration,
      locationID: e.locationID,
      clinicName: locationMap[e.locationID]?.clinicName || 'Necunoscut',
      county: locationMap[e.locationID]?.county || 'Necunoscut',
      locationStatus: locationMap[e.locationID]?.status || 'Necunoscut',
      specialityID: e.specialityID,
      specialityName: specialityMap[e.specialityID] || 'Necunoscut',
      isInvestigationActive: e.isInvestigationActive,
      price: e.price,
    }));

    res.status(200).json({
      success: true,
      message: `Datele pentru investigația ${investigationID} au fost extrase.`,
      data: result
    });

  } catch (error) {
    console.error('Eroare la extragerea investigației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă.',
      error: error.message
    });
  }
};

const getSpecialitiesByInvestigation = async (req, res) => {
  try {
    const { investigationID } = req.body;

    if (!investigationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește investigationID în body.'
      });
    }

    const links = await investigationSpecialityModel.find({ investigationID });

    const specialityIDs = links.map(link => link.specialityID);

    if (specialityIDs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există specialități asociate investigației ${investigationID}.`
      });
    }

    const specialities = await specialityModel.find(
      { specialityID: { $in: specialityIDs } },
      { specialityID: 1, name: 1, _id: 0 }
    );

    res.status(200).json({
      success: true,
      message: `Specialitățile pentru investigația ${investigationID} au fost extrase cu succes.`,
      data: specialities
    });

  } catch (error) {
    console.error('Eroare la extragerea specialităților pentru investigație:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare internă la extragerea specialităților.',
      error: error.message
    });
  }
};


export { 
    getLocationsByInvestigation,
    getSpecialitiesByInvestigation
};
