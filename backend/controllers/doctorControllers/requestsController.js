import requestModel from "../../models/requestModel.js";

import logAction from "../../utils/logAction.js";
import { io } from '../../server.js';

const createRequest = async (req, res) => {
  try {
    const { doctorID, tipSolicitare, prioritate, detalii, descriere} = req.body;

    if (!doctorID || !tipSolicitare || !prioritate || !detalii) {
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
      doctorID,
      tipSolicitare,
      prioritate,
      detalii,
      descriere
    });

    
    await logAction({
      actionType: "CREATE_REQUEST",
      description: `Doctorul ${doctorID} a trimis o cerere de tip '${tipSolicitare}'.`,
      userId: doctorID,
      userRole: "doctor",
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


const getDoctorRequestsByDocID = async (req, res) => {

  try {
    const doctorID = req.params.doctorID;
    
    const requests = await requestModel.find({ userID: doctorID }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } 
  catch (error) {
    console.error("Eroare la preluarea cererilor:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la preluarea cererilor.",
    });
  }
};

const deleteRequestByReqID = async (req, res) => {
  try {
    const requestID = req.params.requestID;

      console.log("Primit req:", requestID)

    const deletedRequest = await requestModel.findOneAndDelete({ requestID });

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Cererea nu a fost găsită." });
    }

    res.status(200).json({
      success: true,
      message: `Cererea ${requestID} a fost ștearsă cu succes.`,
    });
  } catch (error) {
    console.error("Eroare la ștergerea cererii:", error);
    res.status(500).json({ success: false, message: "Eroare la ștergerea cererii." });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await requestModel.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } 
  catch (error) {
    console.error("Eroare la preluarea tuturor cererilor:", error);
    res.status(500).json({
      success: false,
      message: "Eroare la preluarea tuturor cererilor.",
    });
  }
};

 const updateRequest = async (req, res) => {
  try {
    const { requestID } = req.params;
    const updatedData = req.body; 

    if (!requestID) {
      return res.status(400).json({ success: false, message: "RequestID lipsă" });
    }

    const updatedRequest = await requestModel.findOneAndUpdate(
      { requestID },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Cererea nu a fost găsită" });
    }

    await logAction({
      actionType: "UPDATE_REQUEST",
      description: `Adminul ${updatedData.adminID} a actualizat cererea ${requestID}.`,
      userId: updatedData.adminID,
      userRole: "admin",
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Cererea a fost actualizată", data: updatedRequest });
  } catch (error) {
    console.error("Eroare la update:", error);
    res.status(500).json({ success: false, message: "Eroare la update" });
  }
};


export {
    createRequest,
    getDoctorRequestsByDocID,
    getAllRequests,
    deleteRequestByReqID,
    updateRequest

}
