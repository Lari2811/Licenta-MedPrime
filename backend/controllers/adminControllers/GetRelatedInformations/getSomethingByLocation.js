import doctorLocationModel from "../../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";
import specialityLocationModel from "../../../models/specialityLocationModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";

import investigationModel from "../../../models/investigationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import doctorModel from "../../../models/doctorModel.js";

const getDoctorsByLocation = async (req, res) => {
  try {
    const { locationID } = req.body;

    if (!locationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește locationID în body.'
      });
    }

    const doctorLinks = await doctorLocationModel.find({ locationID });

    if (!doctorLinks || doctorLinks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există medici în locația cu ID-ul ${locationID}.`
      });
    }

    const doctorIDs = doctorLinks.map(link => link.doctorID);

    const doctors = await doctorModel.find({ doctorID: { $in: doctorIDs } });

    res.status(200).json({
      success: true,
      message: `Medicii din locația ${locationID} au fost extrași cu succes.`,
      data: doctors 
    });

  } catch (error) {
    console.error(`Eroare la extragerea medicilor pentru locație: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea medicilor.',
      error: error.message
    });
  }
};

const getDoctorsByLocationWithInfos = async (req, res) => {
  try {
    const { locationID } = req.body;

    if (!locationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește locationID în body.'
      });
    }

    const doctorLinks = await doctorLocationModel.find({ locationID });
    if (!doctorLinks || doctorLinks.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există medici în locația cu ID-ul ${locationID}.`
      });
    }

    const doctorIDs = doctorLinks.map(link => link.doctorID);
    const doctors = await doctorModel.find({ doctorID: { $in: doctorIDs } }).lean();

    const doctorSpecialities = await doctorSpecialitiesModel.find({ doctorID: { $in: doctorIDs } }).lean();
    const specialityIDs = doctorSpecialities.map(ds => ds.specialityID);
    const specialities = await specialityModel.find({ specialityID: { $in: specialityIDs } }).lean();

    const specialityMap = {};
    specialities.forEach(spec => {
      specialityMap[spec.specialityID] = spec.name;
    });

    const doctorMap = {};
    doctorSpecialities.forEach(ds => {
      if (!doctorMap[ds.doctorID]) doctorMap[ds.doctorID] = [];
      doctorMap[ds.doctorID].push(specialityMap[ds.specialityID] || 'Necunoscut');
    });

    const result = doctors.map(doc => ({
      doctorID: doc.doctorID,
      firstName: doc.firstName,
      lastName: doc.lastName,
      status: doc.status,
      type: doc.type,
      specialities: doctorMap[doc.doctorID] || []
    }));

    result.sort((a, b) => a.lastName.localeCompare(b.lastName));

    res.status(200).json({
      success: true,
      message: `Medicii din locația ${locationID} au fost extrași cu succes.`,
      data: result
    });

  } catch (error) {
    console.error(`Eroare la extragerea medicilor pentru locație: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea medicilor.',
      error: error.message
    });
  }
};

const getSpecialitiesByLocation = async (req, res) => {
  try {
    const { locationID } = req.body;

    if (!locationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește locationID în body.'
      });
    }

    const links = await specialityLocationModel.find({ locationID });

    const specialityIDs = links.map(link => link.specialityID);

    if (specialityIDs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există specialități în locația ${locationID}.`
      });
    }

    const activeMap = {};
    links.forEach(link => {
      activeMap[link.specialityID] = link.isSpecialityActive;
    });

    const specialities = await specialityModel.find(
      { specialityID: { $in: specialityIDs } },
      { specialityID: 1, name: 1, _id: 0 }
    );

    const result = specialities.map(spec => ({
      specialityID: spec.specialityID,
      name: spec.name,
      isSpecialityActive: activeMap[spec.specialityID] || false
    }));

    result.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      message: `Specialitățile din locația ${locationID} au fost extrase cu succes.`,
      data: result
    });

  } catch (error) {
    console.error('Eroare la extragerea specialităților pentru locație:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea specialităților.',
      error: error.message
    });
  }
};

const getInvestigationsByLocation = async (req, res) => {
  try {
    const { locationID } = req.body;

    if (!locationID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește locationID în body.'
      });
    }

    const availability = await investigationAvailabilityModel.find({ locationID });

    if (availability.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există investigații în locația ${locationID}.`
      });
    }

    const investigationIDs = [...new Set(availability.map(item => item.investigationID))];
    const specialityIDs = [...new Set(availability.map(item => item.specialityID))];

    const investigations = await investigationModel.find(
      { investigationID: { $in: investigationIDs } },
      { investigationID: 1, name: 1, duration: 1, _id: 0 }
    );

    const nameMap = {};
    const durationMap = {};
    investigations.forEach(inv => {
      nameMap[inv.investigationID] = inv.name;
      durationMap[inv.investigationID] = inv.duration; 
    });
    investigations.forEach(inv => {
      nameMap[inv.investigationID] = inv.name;
    });

    const specialities = await specialityModel.find(
      { specialityID: { $in: specialityIDs } },
      { specialityID: 1, name: 1, _id: 0 }
    );
    const specialityMap = {};
    specialities.forEach(spec => {
      specialityMap[spec.specialityID] = spec.name;
    });

    const result = availability.map(item => ({
      investigationID: item.investigationID,
      name: nameMap[item.investigationID] || 'Necunoscut',
      isInvestigationActive: item.isInvestigationActive,
      price: item.price,
      currency: item.currency,
      duration: durationMap[item.investigationID] || null,
      specialityID: item.specialityID,
      specialityName: specialityMap[item.specialityID] || 'Necunoscut'
    }));

    result.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      message: `Investigațiile din locația ${locationID} au fost extrase cu succes.`,
      data: result
    });

  } catch (error) {
    console.error('Eroare la extragerea investigațiilor pentru locație:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea investigațiilor.',
      error: error.message
    });
  }
};






export {
    getDoctorsByLocation,
    getDoctorsByLocationWithInfos, 
    getSpecialitiesByLocation,
    getInvestigationsByLocation
}
