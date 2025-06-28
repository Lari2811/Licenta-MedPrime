import doctorModel from "../../../models/doctorModel.js";
import doctorProfileModel from "../../../models/doctorProfileModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import doctorSpecialitiesModel from "../../../models/doctorspecialities.js";


const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});

    res.status(200).json({
      success: true,
      message: 'Medicii au fost extrași cu succes.',
      data: doctors
    });
  } catch (err) {
    console.error('Eroare la extragerea medicilor:', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea medicilor.',
      error: err.message
    });
  }
};

const getAllDoctorsProfile = async (req, res) => {
  try {
    const doctorsProfile = await doctorProfileModel.find({});

    res.status(200).json({
      success: true,
      message: 'Datele de profil al medicilor au fost extrase cu succes.',
      data: doctorsProfile
    });
  } catch (err) {
    console.error('Eroare la extragerea datelor de profil al medicilor', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea datelor de profil al medicilor.',
      error: err.message
    });
  }
};

const getAllDoctorsLocations = async (req, res) => {
    try {
    const doctorsLocations = await doctorLocationModel.find({});

    res.status(200).json({
      success: true,
      message: 'Relațiile medici-locații au fost extrase cu succes.',
      data: doctorsLocations
    });
  } catch (err) {
    console.error('Eroare la extragerea relaților medici-locați', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea relaților medici-locați.',
      error: err.message
    });
  }
};

const getAllDoctorsSpecialities = async (req, res) => {
    try {
    const doctorsSpecialities = await doctorSpecialitiesModel.find({});

    res.status(200).json({
      success: true,
      message: 'Relațiile medici-specialități au fost extrase cu succes.',
      data: doctorsSpecialities
    });
  } catch (err) {
    console.error('Eroare la extragerea relaților medici-specialități', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea relaților medici-specialități.',
      error: err.message
    });
  }
};


//get all specialities for a Doctor
export const getDoctorSpecialities = async (req, res) => {
  try {
    const { doctorID } = req.body;

    if (!doctorID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește doctorID în body.'
      });
    }

    const specialities = await doctorSpecialitiesModel.find({ doctorID });

    if (!specialities || specialities.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu au fost găsite specialități pentru doctorul cu ID-ul ${doctorID}.`
      });
    }

    const specialityIDs = specialities.map(item => item.specialityID);

    res.status(200).json({
      success: true,
      message: `Specialitățile pentru doctorul cu ID-ul ${doctorID} au fost extrase cu succes.`,
      data: specialityIDs
    });
  } catch (error) {
    console.error(`Eroare la extragerea specialităților pentru doctor: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea specialităților.',
      error: error.message
    });
  }
};

//get all locations for a doctor
const getDoctorLocations = async (req, res) => {
  try {
    const { doctorID } = req.body;

    if (!doctorID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește doctorID în body.'
      });
    }

    const doctorLocations = await doctorLocationModel.find({ doctorID });

    if (!doctorLocations || doctorLocations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Doctorul cu ID-ul ${doctorID} nu are locații asociate.`
      });
    }

    const locationIDs = doctorLocations.map(item => item.locationID);

    const locations = await locationModel.find({ locationID: { $in: locationIDs } });

    res.status(200).json({
      success: true,
      message: `Locațiile pentru doctorul cu ID-ul ${doctorID} au fost extrase cu succes.`,
      data: locations
    });

  } catch (error) {
    console.error(`Eroare la extragerea locațiilor pentru doctor: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea locațiilor.',
      error: error.message
    });
  }
};

//get all doctors for a speciality
const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { specialityID } = req.body;

    if (!specialityID) {
      return res.status(400).json({
        success: false,
        message: 'Lipsește specialityID în body.'
      });
    }

    const doctors = await doctorSpecialitiesModel.find({ specialityID });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Nu au fost găsiți medici pentru specialitatea cu ID-ul ${specialityID}.`
      });
    }

    const doctorIDs = doctors.map(item => item.doctorID);

    res.status(200).json({
      success: true,
      message: `Medicii pentru specialitatea cu ID-ul ${specialityID} au fost extrași cu succes.`,
      data: doctorIDs
    });
  } catch (error) {
    console.error(`Eroare la extragerea medicilor pentru specialitate: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea medicilor.',
      error: error.message
    });
  }
};

export {
    getAllDoctors,
    getAllDoctorsProfile,
    getAllDoctorsLocations,
    getAllDoctorsSpecialities,
    getDoctorSpecialities,
    getDoctorLocations, 
    getDoctorsBySpeciality
}