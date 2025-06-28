import mongoose from 'mongoose';

const doctorSpecialitiesSchema = new mongoose.Schema({

  doctorID: { type: String, required: true },
  specialityID: { type: String, required: true },
  
}, { timestamps: true });

const doctorSpecialitiesModel = mongoose.models.doctorSpecialities || mongoose.model('doctorSpecialities', doctorSpecialitiesSchema);
export default doctorSpecialitiesModel;
