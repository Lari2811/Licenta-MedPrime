import mongoose from "mongoose";

const doctorLocationSchema = new mongoose.Schema({

    doctorID: { type: String, required: true },
    locationID: { type: String, required: true },
    specialityID: {type: String, required: true},

    schedule: [
        {
        day: { type: String, required: true },     
        startTime: { type: String, required: true},               
        endTime: { type: String, required: true },                 
        }
    ]

}, { timestamps: true });

const doctorLocationModel = mongoose.models.doctorLocation || mongoose.model("doctorLocation", doctorLocationSchema);
export default doctorLocationModel;
