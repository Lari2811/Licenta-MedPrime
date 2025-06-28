import mongoose from 'mongoose';

const investigationSpecialitySchema = new mongoose.Schema({

  investigationID: { type: String, required: true },
  specialityID: { type: String, required: true },

}, { timestamps: true });

const investigationSpecialityModel = mongoose.models.investigationSpeciality || mongoose.model('investigationSpeciality', investigationSpecialitySchema);
export default investigationSpecialityModel;
