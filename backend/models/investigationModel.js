import mongoose from "mongoose";

const investigationSchema = new mongoose.Schema({

    investigationID: { type: String, required: true, unique: true },

    profileImage: { type: String, default: "" },

    name: { type: String, required: true },

    shortDescription: { type: [String], default: [] },

    numberOfSlots: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },

    requiresDoctor: { type: Boolean, default:true },

    consultationSteps: { type: [String], default: [] },
    preparationTips: { type: [String], default: [] },

    faq: [
            {
            question: { type: String, default: [] },
            answer: { type: String, default: "" }
            }
        ],

    isInvestigationSetupCompleted: {type: Boolean, default: false}, 

}, { timestamps: true });

const investigationModel = mongoose.models.investigation || mongoose.model("investigation", investigationSchema);
export default investigationModel;












