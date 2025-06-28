import mongoose from "mongoose";

const specialityLocationSchema = new mongoose.Schema({
    
    specialityID: { type: String, required: true },
    locationID: { type: String, required: true },

    isSpecialityActive: {type: Boolean, default: true},
   

}, { timestamps: true });

const specialityLocationModel = mongoose.models.specialityLocation || mongoose.model("specialityLocation", specialityLocationSchema);
export default specialityLocationModel;
