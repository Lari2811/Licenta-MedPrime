import specialityModel from '../../../models/specialityModel.js';
import specialityLocationModel from '../../../models/specialityLocationModel.js';
import locationModel from '../../../models/locationModel.js'; // presupun că ai acest model

export const getAllSpecialitiesWithLocations = async (req, res) => {
  try {
    const specialities = await specialityModel.find().lean();

    const specialityLocations = await specialityLocationModel.find().lean();

    const locations = await locationModel.find().lean();

    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.locationID] = loc;
    });

    const result = specialities.map(spec => {
      const linkedLocs = specialityLocations
        .filter(link => link.specialityID === spec.specialityID)
        .map(link => {
          const loc = locationMap[link.locationID];
          return loc
            ? {
                locationID: loc.locationID,
                name: loc.name,
                county: loc.county,
                isActive: link.isActive
              }
            : null;
        })
        .filter(Boolean); 

      return {
        ...spec,
        linkedLocations: linkedLocs
      };
    });

    res.status(200).json({
        success: true,
        message: 'Specialitățile au fost preluate cu succes',
        data: result
    });

  } catch (err) {
    console.error('Eroare la preluarea specialităților:', err);
    res.status(500).json({ success: false, message: 'Eroare server', error: err.message });
  }
};

export const getSpecialityLocation = async (req, res) => {
  try {
    const allLinks = await specialityLocationModel.find({}, { locationID: 1, specialityID: 1, isActive: 1, _id: 0 });

    res.status(200).json({
      success: true,
      data: allLinks,
      message: 'Datele din tabela SpecialityLocation au fost extrase cu succes.'
    });
  } catch (error) {
    console.error('Eroare la extragerea legăturilor specialitate-locație:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la extragerea legăturilor.',
    });
  }
};
