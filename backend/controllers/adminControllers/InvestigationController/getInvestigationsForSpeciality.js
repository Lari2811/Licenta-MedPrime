import investigationAvailabilityModel from '../../../models/investigationAvailabilityModel.js';
import investigationModel from '../../../models/investigationModel.js';

export const getInvestigationsForSpeciality = async (req, res) => {
  try {
    const links = await investigationAvailabilityModel.find({}, 'specialityID investigationID').lean();
    const allInvestigations = await investigationModel.find({}, 'investigationID name').lean();

    const result = {};
    links.forEach(link => {
      const inv = allInvestigations.find(i => i.investigationID === link.investigationID);
      if (!inv) return;

      if (!result[link.specialityID]) result[link.specialityID] = [];
      if (!result[link.specialityID].some(i => i.investigationID === inv.investigationID)) {
        result[link.specialityID].push(inv);
      }
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Eroare la extragerea investigațiilor:', error);
    res.status(500).json({ success: false, message: 'Eroare server' });
  }
};
