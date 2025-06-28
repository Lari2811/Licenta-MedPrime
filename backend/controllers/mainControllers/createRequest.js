import requestModel from "../../models/requestModel.js";
import userModel from "../../models/userModel.js";

import logAction from "../../utils/logAction.js";

const createRequest = async (req, res) => {
  try {
    const { userID, tipSolicitare, prioritate, detalii, descriere} = req.body;

    if (!userID || !tipSolicitare || !prioritate || !detalii) {
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii!"
      });
    }

    const lastRequest = await requestModel.findOne().sort({ createdAt: -1 });
    let newRequestID = "REQ001";
    if (lastRequest && lastRequest.requestID) {
      const lastNumber = parseInt(lastRequest.requestID.slice(3));
      const nextNumber = lastNumber + 1;
      newRequestID = `REQ${nextNumber.toString().padStart(3, "0")}`;
    }

    const newRequest = await requestModel.create({
      requestID: newRequestID,
      userID,
      tipSolicitare,
      prioritate,
      detalii,
      descriere
    });

    const user = await userModel.findOne({ linkedID: userID });

    if (!user) {
    return res.status(404).json({ success: false, message: "Utilizatorul nu a fost găsit!" });
    }

    const userRole = user.role;

    let roleDescriere;
    if (userRole === 'doctor') roleDescriere = 'Doctorul';
    else if (userRole === 'patient') roleDescriere = 'Pacientul';
    else if (userRole === 'admin') roleDescriere = 'Administratorul';
    else roleDescriere = 'Utilizatorul'; 

    const description = `${roleDescriere} ${userID} a trimis o cerere de tip '${tipSolicitare}'.`;

    await logAction({
    actionType: "CREATE_REQUEST",
    description: description,
    userId: userID,
    userRole: userRole,
    ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Cerere creată cu succes!",
      data: newRequest,
    });

  } catch (error) {
    console.error("Eroare la crearea cererii:", error);
    res.status(500).json({
      success: false,
      message: "Eroare internă la crearea cererii."
    });
  }
};

export {
    createRequest}




