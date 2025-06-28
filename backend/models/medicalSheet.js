import mongoose from "mongoose";
 
const medicalSheetSchema = new mongoose.Schema({

  medicalSheetID: {type: String, required: true, unique: true},

  appointmentID: { type: String, required: true },
  patientID: { type: String, required: true },
  doctorID: { type: String, required: true },

  diagnostic: { type: String, required: true },
  rezumat: { type: String, required: true },
  recomandari: { type: String, required: true },
  trimiteri: { type: String },

  treatments: [
    {
      medicament: { type: String, required: true },
      dozaj: { type: String, required: true },
      startDate: { type: String, required: true },
      durata: { type: String, required: true },
      observatii: { type: String }
    }
  ],

  atasamente: [String], 
  
}, { timestamps: true });

const medicalSheetModel = mongoose.models.medicalSheet || mongoose.model("medicalSheet", medicalSheetSchema);
export default medicalSheetModel;
