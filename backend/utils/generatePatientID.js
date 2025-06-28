import patientModel from "../models/patientModel.js";

export const generatePatientID = async () => {
  const last = await patientModel.findOne({}).sort({ createdAt: -1 }).lean();
  if (!last || !last.patientID) return 'P001';

  const nr = parseInt(last.patientID.replace('P', '')) || 0;
  return 'P' + (nr + 1).toString().padStart(3, '0');
};