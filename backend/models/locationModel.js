import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  locationID: { type: String, required: true, unique: true },

  clinicName: { type: String, required: true },          
  phone: { type: String, default: "" },
  email: { type: String, default: "" },

  address: {
    address_details: {type: String, default: "" },
    city: { type: String, default: "" },
    county: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },

  schedule: [
    {
      day: { type: String, required: true },       
      startTime: { type: String },                  
      endTime: { type: String },                   
    }
  ],

  images: {
    profileImage: { type: String, default: "" },                     
    gallery: { type: [String], default: [] }        
  },

  infoProfile: {type: String, default: ""},

  otherInformations: {type: [String], default: []},

  facilities: {type: [String], default: []},

  isLocationActive: {type: Boolean, default: true}, 
  
  status: {type: String, enum: ["deschis", "inchis temporar", "inchis definitiv", ""], default:""},
  closedReason: { type: String, default: ""},
  reopenDate: { type: Date, default: null },

  isLocationSetupCompleted: {type: Boolean, default: false}, 

  

}, { timestamps: true }); 

const locationModel = mongoose.models.location || mongoose.model("location", locationSchema);
export default locationModel;
