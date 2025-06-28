import patientModel from "../../models/patientModel.js";
import userModel from "../../models/userModel.js";

import logAction from "../../utils/logAction.js";
import cloudinary from "../../utils/cloudinary.js";

// Extrage public_id din URL Cloudinary
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const splitPart = url.split("/upload/")[1];
  if (!splitPart) return null;
  const withoutVersion = splitPart.split("/").slice(1).join("/");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

export const updatePatientProfile = async (req, res) => {
  const { patientID } = req.params;
  const { patientDataForm, oldProfileImage } = req.body;

  try {
    const parsedData = JSON.parse(patientDataForm);

    // Gasim pacientul
    const patient = await patientModel.findOne({ patientID });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Pacientul nu a fost găsit." });
    }

    // Pregătim campurile de update
    const updateFields = { ...parsedData };

    // Imagine noua
    if (req.file) {
      if (oldProfileImage) {
        const publicId = getPublicIdFromUrl(oldProfileImage);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log("Imagine veche ștearsă din Cloudinary:", publicId);
          } catch (error) {
            console.error("Eroare la ștergerea imaginii vechi:", error);
          }
        }
      }

      updateFields.profileImage = req.file.path;
    }

    // Update in baza de date
    const updatedPatient = await patientModel.findOneAndUpdate(
      { patientID },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: "Pacientul nu a fost găsit la update." });
    }

    // Log actiune
    await logAction({
      actionType: "UPDATE_PATIENT_PROFILE",
      description: `Pacientul ${patientID} și-a actualizat profilul.`,
      userId: patientID,
      userRole: "patient",
      ipAddress: req.ip,
    });
    
    //profil completat
    await userModel.updateOne(
      { linkedID: patientID }, 
      { $set: 
        { mustCompleteProfile: false,
          isActive: true 
        } 
      }
    );

    res.status(200).json({ success: true, message: "Profil actualizat cu succes!", data: updatedPatient });

  } catch (error) {
    console.error("Eroare la update profil pacient:", error);
    res.status(500).json({ success: false, message: "Eroare server.", error: error.message });
  }
};

export const checkCNP = async (req, res) => {
  try {
    const { cnp } = req.body;

    if (!cnp) {
      return res.status(400).json({ success: false, message: "CNP-ul este necesar." });
    }

    const existingPatient = await patientModel.findOne({ cnp });

    return res.status(200).json({ exists: !!existingPatient });
  } catch (error) {
    console.error("Eroare la verificarea CNP:", error);
    res.status(500).json({ success: false, message: "Eroare internă la verificarea CNP." });
  }
};
