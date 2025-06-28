import doctorModel from "../../../models/doctorModel.js";

export const getAllLocations = async (req, res) => {
  try {
    const locations = await locationModel.find({});

    res.status(200).json({
      success: true,
      message: 'Locațiile au fost extrase cu succes.',
      locations: locations
    });
  } catch (err) {
    console.error('Eroare la extragerea locațiilor:', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea locațiilor.',
      error: err.message
    });
  }
};