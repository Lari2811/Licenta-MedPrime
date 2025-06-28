import mongoose from "mongoose";

const investigationAvailabilitySchema = new mongoose.Schema({

  investigationID: { type: String, required: true },
  locationID: { type: String, required: true },
  specialityID: { type: String, required: true },

  isInvestigationActive: {type: Boolean, default: true},

 
  price: { type: Number, required: true },           
  currency: { type: String, default: "RON" },

}, { timestamps: true });

const investigationAvailabilityModel = mongoose.models.investigationAvailability || mongoose.model("investigationAvailability", investigationAvailabilitySchema);
export default investigationAvailabilityModel;
