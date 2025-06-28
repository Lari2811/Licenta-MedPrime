import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminID: { type: String, required: true, unique: true },

    firstName: { type: String, required: true},
    lastName:  { type: String, required: true},
      
    phone:  { type: String, required: true},
    email: { type: String, required: true, unique: true },

    cnp: { type: String, unique: true, default: "" },
    birthDate: { type: String, default: "" },
    age: { type: Number, default: "" },

    gender: { type: String, enum: ["feminin", "masculin", "altul", "" ], default: "" },

     address: {
        address_details: { type: String, default: "" },
        city: { type: String, default: "" },
        county: { type: String, default: "" },
        postalCode: { type: String, default: "" },
    },


    status: {type: String, enum:[ "activ", "concediu", "in asteptare", "blocat", "suspendat"], default: "in asteptare"},
    leaveType: {type: String, enum: ["medical", "odihna", "maternitate", "studii", "altul"], default: null},
    
    profileImage: { type: String, default: "" },
  
  },{ timestamps: true }
);

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
