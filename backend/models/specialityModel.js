import mongoose from "mongoose";

const specialitySchema = new mongoose.Schema({

  specialityID: { type: String, required: true, unique: true },

  name: { type: String, required: true },

  shortDescription: { type: String },

  otherInfo: { type: [String], default: [] },
  
  profileImage: { type: String, default: "" },

  reasonsToConsult: { type: [String], default: [] },       
  consultationBenefits: { type: [String], default: [] },  

  faq: [
    {
      question: { type: String, default: "" },
      answer: { type: String, default: "" }
    }
  ],

  isSpecialitySetupCompleted: {type: Boolean, default: false}, 
  
}, { timestamps: true });

const specialityModel = mongoose.models.speciality || mongoose.model("speciality", specialitySchema);
export default specialityModel;
