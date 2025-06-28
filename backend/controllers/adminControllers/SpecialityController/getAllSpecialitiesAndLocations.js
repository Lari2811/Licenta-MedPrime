import specialityLocationModel from "../../../models/specialityLocationModel.js";
import specialityModel from "../../../models/specialityModel.js";


const getAllSpecialities = async (req, res) => {
  try {
    const specialities = await specialityModel.find({});

    res.status(200).json({
      success: true,
      message: 'Specialitățiile au fost extrase cu succes.',
      data: specialities
    });
  } catch (err) {
    console.error('Eroare la extragerea specialităților:', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea specialităților.',
      error: err.message
    });
  }
};

const getAllSpecialityLocations = async (req, res) => {
  try {
    const specialityLocation = await specialityLocationModel.find({});

    res.status(200).json({
      success: true,
      message: 'Locațiile specialităților au fost extrase cu succes.',
      data: specialityLocation
    });
  } catch (err) {
    console.error('Eroare la extragerea locațiilor specialităților.', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea locațiilor specialităților.',
      error: err.message
    });
  }
};

export {
    getAllSpecialities,
    getAllSpecialityLocations
}