import doctorModel from "../models/doctorModel.js";

export const generateDoctorID = async () => {
  const last = await doctorModel.findOne({}).sort({ createdAt: -1 }).lean();
  if (!last || !last.doctorID) return 'DR001';

  const nr = parseInt(last.doctorID.replace('DR', '')) || 0;
  return 'DR' + (nr + 1).toString().padStart(3, '0');
};