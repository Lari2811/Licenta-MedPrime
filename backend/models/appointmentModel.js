import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({

    appointmentID: { type: String, required: true, unique: true },

    patientID: { type: String, required: true },
    investigationID: { type: String, required: true },
    locationID: { type: String, required: true },
    specialityID: { type: String, required: true },
    doctorID: { type: String, required: true }, 
   

    date: { type: String, required: true },       
    startTime: { type: String, required: true },   
    endTime: { type: String, required: true},     

    
    status: {
        type: String,
        enum: ["in asteptare", "confirmata", "in desfasurare", "anulata", "finalizata"],
        default: "in asteptare"
    },

    canceledReason: { type: String, default: null },
    canceledBy: {
        type: String,
        enum: ["patient", "doctor", "admin", ""],
        default: ""
        },

    notes: { type: String, default: "" },
    
    patientFeedbackGiven: { type: Boolean, default: false },
    doctorFeedbackGiven: { type: Boolean, default: false }

}, { timestamps: true });

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;
