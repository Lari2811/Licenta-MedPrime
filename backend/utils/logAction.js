import actionLogModel from "../models/actionLogModel.js";

const logAction = async ({ actionType, description, userId, userRole, ipAddress, details = {} }) => {
  try {
    await actionLogModel.create({
      actionType,
      description,
      userId,
      userRole,
      ipAddress,
      details, 
    });
  } catch (error) {
    console.error("Eroare la logarea acțiunii:", error);
  }
};

export default logAction;
