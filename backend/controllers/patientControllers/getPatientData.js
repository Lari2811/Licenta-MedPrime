import patientModel from "../../models/patientModel.js";

//gen an Patient after ID
const getPatientById = async (req, res) => {
 try {
    const { patientID } = req.params;

    const patient = await patientModel.findOne({ patientID: patientID });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Pacientul cu ID-ul ${patientID} nu a fost găsit.`,
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
      message: `Pacientul cu ID-ul ${patientID} a fost găsit.`,
    });

  } catch (error) {
    console.error('Eroare la getPatientById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare server. Încearcă din nou.',
    });
  }
};
  

export {
    getPatientById
}