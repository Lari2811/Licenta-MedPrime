import doctorLocationModel from "../../../models/doctorLocationModel.js";


export const addDoctorLocations = async (req, res) => {
  try {
    const entries = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Trebuie trimisă o listă de locații.",
      });
    }

    for (let entry of entries) {
      const { doctorID, locationID, specialityID, cabinetNumber, schedule } = entry;

      if (!doctorID || !locationID || !specialityID || !cabinetNumber || !Array.isArray(schedule)) {
        return res.status(400).json({
          success: false,
          message: "Toate câmpurile sunt obligatorii pentru fiecare locație.",
        });
      }
    }

    await doctorLocationModel.insertMany(entries);

    res.status(201).json({
      success: true,
      message: "Locațiile medicului au fost salvate cu succes.",
    });
  } catch (error) {
    console.error("Eroare la salvarea locațiilor medicului:", error);
    res.status(500).json({
      success: false,
      message: "Eroare server la salvarea locațiilor.",
    });
  }
};
