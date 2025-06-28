import appointmentModel from "../../../models/appointmentModel.js";
import doctorLocationModel from "../../../models/doctorLocationModel.js";
import investigationModel from "../../../models/investigationModel.js";
import { parse, isBefore, addMinutes, format } from "date-fns";


export const getAvailableSlots = async (req, res) => {
  console.log("📥 Primit în body:", req.body);

  try {
    const {
      doctorID,
      locationID,
      specialityID,
      date,
      investigationID
    } = req.body;

    if (!doctorID || !locationID || !specialityID || !date || !investigationID) {
      return res.status(400).json({ error: "Toți parametrii sunt necesari." }); 
    }

    // Cauta programul medicului
    const doctorLocation = await doctorLocationModel.findOne({ doctorID, locationID, specialityID });
    if (!doctorLocation || !doctorLocation.schedule) {
      return res.status(401).json({ error: "Medicul nu are un program definit în această locație." }); 
    }

    //  Gasesc ziua sapt
    const zileRomana = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"];
    const zi = new Date(date).getDay();
    const dayOfWeek = zileRomana[zi];


    const daySchedule = doctorLocation.schedule.find(s => s.day.toLowerCase() === dayOfWeek);
    if (!daySchedule) {
      return res.status(402).json({ error: "Medicul nu lucrează în acea zi." }); 
    }

    const startTime = daySchedule.startTime;
    const endTime = daySchedule.endTime;

    //  Durata investigatiei
    const investigation = await investigationModel.findOne({ investigationID });
    if (!investigation) {
      return res.status(403).json({ error: "Investigația selectată nu există." }); 
    }

    const durationMinutes = investigation.duration || 30;

    // Programari existente - care nu sunt anulate
    const appointments = await appointmentModel.find({
      doctorID,
      locationID,
      date,
      status: { $in: ["in asteptare", "confirmata", "in desfasurare"] } // DOAR activele
    });

    const bookedIntervals = appointments.map(app => ({
      start: app.startTime,
      end: app.endTime
    }));

    //  Calcul sloturi disponibile
    const slots = [];
    const isToday = new Date().toISOString().slice(0, 10) === date;
    const now = new Date();
    let current = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const end = parse(`${date} ${endTime}`, "yyyy-MM-dd HH:mm", new Date());

   while (
      isBefore(addMinutes(current, durationMinutes), end) ||
      +addMinutes(current, durationMinutes) === +end
    ) {
      const slotStart = format(current, "HH:mm");
      const slotEnd = format(addMinutes(current, durationMinutes), "HH:mm");

      const overlap = bookedIntervals.some(interval =>
        (slotStart < interval.end && slotEnd > interval.start)
      );

      const isInFuture = !isToday || current > now;

      if (!overlap && isInFuture) {
        slots.push({ startTime: slotStart, endTime: slotEnd });
      }
      current = addMinutes(current, 15);
    }


    if (slots.length === 0) {
      return res.status(404).json({ error: "Nu mai există sloturi libere pentru acea zi." });
    }

    return res.status(200).json({ slots });

  } catch (err) {
    return res.status(500).json({ error: "Eroare server. Încearcă din nou mai târziu." }); // 🔴 500
  }
};
