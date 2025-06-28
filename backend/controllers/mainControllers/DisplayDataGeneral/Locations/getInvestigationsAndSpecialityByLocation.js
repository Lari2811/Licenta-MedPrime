import investigationAvailabilityModel from "../../../../models/investigationAvailabilityModel.js";
import investigationModel from "../../../../models/investigationModel.js";
import specialityModel from "../../../../models/specialityModel.js";

export const getInvestigationsAndSpecialityByLocation = async (req, res) => {
  try {
    const { locationID } = req.body;

    // Toate INV active din locatiii
    const availabilities = await investigationAvailabilityModel.find({
      locationID,
      isInvestigationActive: true
    });

    // Extrag ID-urile unice pt INV si SPEC
    const investigationIDs = [...new Set(availabilities.map(item => item.investigationID))];
    const specialityIDs = [...new Set(availabilities.map(item => item.specialityID))];

    // Iau INV și SPEC
    const investigations = await investigationModel.find({
      investigationID: { $in: investigationIDs }
    });
    const specialities = await specialityModel.find({
      specialityID: { $in: specialityIDs }
    });

    const investigationMap = {};
    investigations.forEach(inv => {
      investigationMap[inv.investigationID] = inv;
    });

    const specialityMap = {};
    specialities.forEach(spec => {
      specialityMap[spec.specialityID] = spec.name;
    });

    // Grupare INV pe SPEC
    const grouped = {};

    availabilities.forEach(av => {
      const inv = investigationMap[av.investigationID];
      const specName = specialityMap[av.specialityID];

      if (!inv || !specName) {
        console.warn(" Lipsă investigație sau specialitate pentru:", av);
        return;
      }

      if (!grouped[av.specialityID]) {
        grouped[av.specialityID] = {
          specialityID: av.specialityID,
          specialityName: specName,
          investigations: []
        };
      }

      grouped[av.specialityID].investigations.push({
        investigationID: av.investigationID,
        name: inv.name,
        price: av.price,
        currency: av.currency
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error(" Eroare la preluarea investigațiilor:", error);
    res.status(500).json({ message: "Eroare internă la server" });
  }
};
