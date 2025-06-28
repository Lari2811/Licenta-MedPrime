import mongoose from "mongoose";

const patientFeedbackSchema = new mongoose.Schema({

    patientFeedbackID: {type: String, required: true, unique: true},
        
    appointmentID: { type: String, required: true, unique: true}, 
    patientID: { type: String, required: true },
    doctorID: { type: String, required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: [String] },

}, { timestamps: true });

const patientFeedbackModel = mongoose.models.patientFeedback || mongoose.model("patientFeedback", patientFeedbackSchema);
export default patientFeedbackModel;
