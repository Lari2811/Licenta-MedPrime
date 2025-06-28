import locationModel from '../../../models/locationModel.js';
import doctorLocationModel from '../../../models/doctorLocationModel.js';

const getAllLocations = async (req, res) => {
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



//get all doctors from an location
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


export {
  getAllLocations, 
  getDoctorsByLocation
}