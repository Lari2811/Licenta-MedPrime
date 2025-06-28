import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
    
    doctorID: { type: String, required: true, unique: true },

    about: { type: [String], default: [] },
    expertise: { type: [String], default: [] },
    approach: { type: [String], default: [] },
    roleInClinic: { type: [String], default: [] },

    cvLink: { type: String , default: "" },

    

}, { timestamps: true });

const doctorProfileModel = mongoose.models.doctorProfile || mongoose.model("doctorProfile", doctorProfileSchema);
export default doctorProfileModel;
