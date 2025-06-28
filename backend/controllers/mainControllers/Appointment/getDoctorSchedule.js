import doctorLocationModel from "../../../models/doctorLocationModel.js";

export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorID, locationID, specialityID } = req.query;

    if (!doctorID || !locationID || !specialityID) {
      return res.status(400).json({ error: "Toți parametrii sunt necesari." });
    }

    const doctorLocation = await doctorLocationModel.findOne({
      doctorID,
      locationID,
      specialityID
    });

    if (!doctorLocation || !doctorLocation.schedule || doctorLocation.schedule.length === 0) {
      return res.status(404).json({ error: "Medicul nu are program definit pentru această locație." });
    }

    const schedule = doctorLocation.schedule.map((entry) => ({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime
    }));

    res.status(200).json({ schedule });
  } catch (err) {
    console.error("Eroare la preluarea programului:", err);
    res.status(500).json({ error: "Eroare server." });
  }
};
