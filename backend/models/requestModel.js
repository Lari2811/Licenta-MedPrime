import mongoose from "mongoose";


const requestSchema = new mongoose.Schema(
    {

    requestID: { type: String, required: true, unique: true },

    userID: { type: String, required: true },

    adminID: { type: String, default: null },

    tipSolicitare: {type: String, enum: ["MODIFICARE_DATE_PERSONALE", "MODIFICARE_SPECIALITATE", "MODIFICARE_LOCATII_SI_PROGRAM", "ALTE_SOLICITARI"],
        required: true,
    },

    prioritate: {type: String, enum: ["URGENT", "NORMAL", "INFORMATIV"], required: true,
    },

    detalii: {type: mongoose.Schema.Types.Mixed, 
        required: true,
    },

    status: {
        type: String,
        enum: ["NEASIGNAT", "ASIGNAT", "IN_PROGRES", "FINALIZAT", "RESPINS"],
        default: "NEASIGNAT"
    },

    raspunsAdmin: {
        type: String,
        default: ""
    },

    descriere: {
        type: String,
        default: ""
    },


    }, { timestamps: true });

const requestModel = mongoose.models.Request || mongoose.model("request", requestSchema);
export default requestModel;