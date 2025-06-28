import specialityModel from '../../../../models/specialityModel.js';
import locationModel from '../../../../models/locationModel.js';
import investigationModel from '../../../../models/investigationModel.js';
import investigationAvailabilityModel from '../../../../models/investigationAvailabilityModel.js';
import specialityLocationModel from '../../../../models/specialityLocationModel.js';

export const getSpecialitiesWithData = async (req, res) => {
  try {
    const specialities = await specialityModel.find();

    const results = await Promise.all(
      specialities.map(async (spec) => {
        const specID = spec.specialityID;

        const activeLocs = await specialityLocationModel.find({
          specialityID: specID,
          isSpecialityActive: true,
        });

        const specialityLocations = await Promise.all(
          activeLocs.map(async (item) => {
            const loc = await locationModel.findOne({ locationID: item.locationID });
            return loc
              ? {
                  locationID: loc.locationID,
                  clinicName: loc.clinicName,
                  address: loc.address,
                }
              : null;
          })
        );

        const availabilities = await investigationAvailabilityModel.find({
          specialityID: specID,
          isInvestigationActive: true,
        }).select('investigationID price currency locationID');

        const investigationIDs = availabilities.map(a => a.investigationID);
        const investigationsRaw = await investigationModel.find({
          investigationID: { $in: investigationIDs }
        });

        const investigationAvailability = await Promise.all(availabilities.map(async (avail) => {
          const inv = investigationsRaw.find(i => i.investigationID === avail.investigationID);
          const loc = await locationModel.findOne({ locationID: avail.locationID });

          return {
            investigationID: avail.investigationID,
            investigationName: inv?.name || '',
            locationID: avail.locationID,
            clinicName: loc?.clinicName || '',
            address: loc?.address || '',
            price: avail.price,
            currency: avail.currency
          };
        }));

        const uniqueMap = new Map();
        investigationsRaw.forEach(inv => {
          if (!uniqueMap.has(inv.investigationID)) {
            const { _id, ...rest } = inv._doc; 
            uniqueMap.set(inv.investigationID, rest);
          }
        });

        const investigationSpeciality = Array.from(uniqueMap.values());

        return {
          ...spec._doc,
          locations: specialityLocations.filter(Boolean),
          investigationAvailability,
          investigationSpeciality,
        };
      })
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Eroare la specialități cu locații și investigații:', error);
    res.status(500).json({ success: false, message: 'Eroare server' });
  }
};
