import doctorLocationModel from "../../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";
import specialityLocationModel from "../../../models/specialityLocationModel.js";
import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";

import locationModel from "../../../models/locationModel.js";
import investigationModel from "../../../models/investigationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import doctorModel from "../../../models/doctorModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";


const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { specialityID } = req.body;

    if (!specialityID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește specialityID în body.'
      });
    }

    const doctorLinks = await doctorSpecialitiesModel.find({ specialityID });

    const doctorIDs = doctorLinks.map(link => link.doctorID);

    if (doctorIDs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există medici pentru specialitatea ${specialityID}.`
      });
    }

    const doctors = await doctorModel.find(
      { doctorID: { $in: doctorIDs } },
      { doctorID: 1, firstName: 1, lastName: 1, status: 1, type: 1, rating: 1, _id: 0 }
    );

    res.status(200).json({
      success: true,
      message: `Medicii pentru specialitatea ${specialityID} au fost extrași cu succes.`,
      data: doctors
    });

  } catch (error) {
    console.error('Eroare la extragerea medicilor pentru specialitate:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea medicilor.',
      error: error.message
    });
  }
};

const getLocationsBySpeciality = async (req, res) => {
  try {
    const { specialityID } = req.body;

    if (!specialityID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește specialityID în body.'
      });
    }

    const links = await specialityLocationModel.find({ specialityID });

    const locationsIDs = links.map(link => link.locationID);

    if (locationsIDs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există locații în specialitatea ${specialityID}.`
      });
    }

    const activeMap = {};
    links.forEach(link => {
      activeMap[link.locationID] = link.isSpecialityActive;
    });


    const locations = await locationModel.find(
      { locationID: { $in: locationsIDs } },
      { locationID: 1, clinicName: 1, address: 1, status: 1, _id: 0 }
    );

    const result = locations.map(loc => ({
      locationID: loc.locationID,
      clinicName: loc.clinicName,
      status: loc.status,
      county: loc.address.county,
      isSpecialityActive: activeMap[loc.locationID] || false
    }));

    result.sort((a, b) => a.county.localeCompare(b.county));

    res.status(200).json({
      success: true,
      message: `Locațiile in care se găsesc specialitatea ${specialityID} au fost extrase cu succes.`,
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

const getInvestigationsBySpeciality = async (req, res) => {
  try {
    const { specialityID } = req.body;

    if (!specialityID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește specialityID în body.'
      });
    }

    const invLinks = await investigationSpecialityModel.find({ specialityID });

    const invIDs = invLinks.map(link => link.investigationID);

    if (invIDs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu există investigații pentru specialitatea ${specialityID}.`
      });
    }

    const investigations = await investigationModel.find(
      { investigationID: { $in: invIDs } },
      { investigationID: 1, name: 1, duration: 1, status: 1, type: 1, rating: 1, _id: 0 }
    );

    res.status(200).json({
      success: true,
      message: `Investigațiile pentru specialitatea ${specialityID} au fost extrași cu succes.`,
      data: investigations
    });

  } catch (error) {
    console.error('Eroare la extragerea investigațiile pentru specialitate:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea investigațiilor.',
      error: error.message
    });
  }
};


export {
    getDoctorsBySpeciality, 
    getLocationsBySpeciality,
    getInvestigationsBySpeciality

}