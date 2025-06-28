import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ["doctor", "patient", "admin"],
        required: true
    },

    linkedID: { type: String, required: true, unique: true }, 

    isActive: { type: Boolean, default: true},
    mustCompleteProfile: { type: Boolean, default: true } 

}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
