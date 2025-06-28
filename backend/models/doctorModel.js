import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({

    doctorID: { type: String, required: true, unique: true }, 
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address:  {type: String, default: ""},
    
    status: {type: String, enum:[ "activ", "concediu", "in asteptare", "blocat", "suspendat"], default: "in asteptare"},
    leaveType: {type: String, enum: ["medical", "odihna", "maternitate", "studii", "altul"], default: null},
    
    type: { type: String, enum: ["rezident", "specialist", "primar"], required: true },

    cnp: { type: String, default: "" },
    birthDate: { type: String, default: null },
    age: { type: Number, default: null },

    gender: { type: String, enum: ["feminin", "masculin", "altul", ""], default: "" },

    parafaCode: { type: String, default: "" }, 
    certifications: { type: [String], default: [] },
    studies: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    languagesSpoken: { type: [String], default: [] },

    profileImage: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    hasSpeciality: {type: Boolean, default: false}

}, { timestamps: true });

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
