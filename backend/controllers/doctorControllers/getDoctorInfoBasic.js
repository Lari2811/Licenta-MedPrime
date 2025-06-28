import doctorModel from "../../models/doctorModel.js";

export const getDoctorBasicByID = async (req, res) => {
  const { doctorID } = req.body;

  try {
    if (!doctorID) {
      return res.status(400).json({ success: false, message: "Lipsă doctorID." });
    }

    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Medicul nu a fost găsit." });
    }
    
    return res.status(200).json({
      success: true,
      data: doctor,
    });

    

  } catch (err) {
    console.error("Eroare la getDoctorByID:", err);
    return res.status(500).json({
      success: false,
      message: "Eroare la preluarea medicului.",
    });
  }
};
