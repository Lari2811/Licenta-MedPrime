import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },

  userId: {
    type: String, 
  },

  userRole: {
    type: String,
    enum: ["doctor", "admin", "patient"],
    required: true,
  },

  ipAddress: {
    type: String,
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}, 
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ActionLog = mongoose.models.ActionLog || mongoose.model("ActionLog", actionLogSchema);

export default ActionLog;
