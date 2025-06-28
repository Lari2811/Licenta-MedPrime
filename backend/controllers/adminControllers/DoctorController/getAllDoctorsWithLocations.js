import doctorModel from "../../../models/doctorModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";

export const getAllDoctorsWithLocations = async (req, res) => {
  try {
    const doctors = await doctorModel.find();

    const locations = await doctorLocationModel.find();

    const result = doctors.map(doctor => {
      const doctorLocs = locations.filter(loc => loc.doctorID === doctor.doctorID);
      return {
        ...doctor._doc,
        locations: doctorLocs,
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Eroare la preluarea doctorilor:", error);
    res.status(500).json({
      success: false,
      message: "Eroare server la preluarea doctorilor.",
    });
  }
};
