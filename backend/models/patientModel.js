import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({

    patientID: { type: String, required: true, unique: true },
    
    lastName: { type: String, required: true, default: "" },
    firstName: { type: String, required: true, default: "" },

    email: { type: String, required: true, unique: true, default: "" },
    phone: { type: String, default: "" },

    cnp: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    age: { type: Number, default: "" },

    gender: { type: String, enum: ["feminin", "masculin", "altul", "" ], default: "" },

     address: {
        address_details: { type: String, default: "" },
        city: { type: String, default: "" },
        county: { type: String, default: "" },
        postalCode: { type: String, default: "" },
    },

    bloodGroup: { type: String, enum: ["A", "B", "AB", "0", "nu cunosc", ""], default: "" },        
    rh: { type: String, enum: ["negativ", "pozitiv", "nu cunosc", ""],default: "" },                 

    insurance: { type: String, enum: ["CNAS", "privat", "neasigurat", ""], default: "" },

    allergies: { type: [String], default: [] },
    
    familyDoctor: { type: String, default: "" },

    emergencyContact: {
        fullName: { type: String, default: "" },
        relation: { type: String, default: "" },
        phone: { type: String, default: "" },
    },

    occupation: {
        profession: { type: String, enum: ["angajat", "somer", "elev", "student", "pensionar", "casnic", "altul", ""], default: "" },
        workPlace: { type: String, default: "" },        // doar pt ANGAJAT
        domain: { type: String, default: "" },           // doar pt ANGAJAT professionalFields
        institution: { type: String, default: "" },      // doar pt ELEV/STUDENT
        otherDetails: { type: String, default: "" },     // doar pt ALTU
    },

    profileImage: { type: String, default: "" },
    
    status: { type: String,  enum: ["activ", "in asteptare", "suspendat"],   default: "in asteptare" },

}, { timestamps: true });

const patientModel = mongoose.models.patient || mongoose.model("patient", patientSchema);
export default patientModel;
