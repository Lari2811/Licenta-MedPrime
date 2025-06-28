import investigationAvailabilityModel from "../../../models/investigationAvailabilityModel.js";
import investigationModel from "../../../models/investigationModel.js";
import investigationSpecialityModel from "../../../models/investigation_specialities.js";

const getAllInvestigations = async (req, res) => {
    try {

        const investigations = await investigationModel.find().sort({ name: 1 });
        res.status(220).json({
            success: true,
            message: "Investigatiile au fost extrase cu succes.",
            data: investigations
        });
        
    } catch (err) {
    console.error('Eroare la extragerea investigatiilor', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea investigatii.',
      error: err.message
    });
  }
};

const getAllInvestigationsAvailability  = async (req, res) => {
    try {
        const invAvailability = await investigationAvailabilityModel.find({});

        res.status(220).json({
            success: true,
            message: "Investigatiile disponibile au fost extrase cu succes.",
            data: invAvailability
        });
        
    } catch (err) {
    console.error('Eroare la extragerea investigatiilor', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea investigatii.',
      error: err.message
    });
  }
};


const getAll_INV_SPEC = async (req, res) => {
    try {
        const investigations = await investigationSpecialityModel.find({});

        res.status(220).json({
            success: true,
            message: "Relațiile între investigații și specialități au fost extrase cu succes.",
            data: investigations
        });
        
    } catch (err) {
    console.error('Eroare la extragerea relaților', err);
    res.status(500).json({
      success: false,
      message: 'Eroare la extragerea relaților.',
      error: err.message
    });
  }
};

export {
    getAllInvestigations,
    getAllInvestigationsAvailability,
    getAll_INV_SPEC
}


