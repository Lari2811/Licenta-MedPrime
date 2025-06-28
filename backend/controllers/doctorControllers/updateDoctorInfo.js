import doctorModel from "../../models/doctorModel.js";
import doctorProfileModel from "../../models/doctorProfileModel.js";
import userModel from "../../models/userModel.js";
import doctorLocationModel from "../../models/doctorLocationModel.js";

import cloudinary from "../../utils/cloudinary.js";

import bcrypt from "bcryptjs";

import logAction from "../../utils/logAction.js";

const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const splitPart = url.split("/upload/")[1]; 
  if (!splitPart) return null;
  const withoutVersion = splitPart.split("/").slice(1).join("/"); 
  return withoutVersion.replace(/\.[^/.]+$/, ""); 
};


const updateDoctorPersonalInfo = async (req, res) => {
  const { doctorID } = req.params;
  const { type, gender, address, oldProfileImage } = req.body;
  const profileImageFile = req.file; 

    console.log("oldProfileImage:", oldProfileImage);

    console.log(getPublicIdFromUrl(oldProfileImage))
  try {
    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) {
        return res.status(404).json({ message: "Doctorul nu a fost găsit." });
    }

    const updateFields = { type, gender, address };

    if (profileImageFile && oldProfileImage) {
        const publicId = getPublicIdFromUrl(oldProfileImage);
        console.log("Public ID extras:", publicId);

        if (publicId) {
            try {
            const response = await cloudinary.uploader.destroy(publicId);
            console.log("Poză veche ștearsă din Cloudinary:", response);
            } catch (error) {
            console.error("Eroare la ștergerea pozei vechi:", error);
            }
        }

        updateFields.profileImage = profileImageFile.path;
        }

    await doctorModel.updateOne(
      { doctorID },
      { $set: updateFields }
    );

    await logAction({
      actionType: "UPDATE_PERSONAL_INFO",
      description: `Doctorul ${doctorID} și-a schimbat datele personale.`,
      userId: doctorID,
      userRole: "doctor",
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Datele personale au fost actualizate cu succes!", data: updateFields });
  } catch (error) {
    console.error("Eroare la actualizare date personale:", error);
    res.status(500).json({ message: "Eroare la actualizare date personale.", error: error.message });
  }
};

const updateDoctorProfessionalInfo = async (req, res) => {

  try {
    
    const { doctorID } = req.params;
    const { certifications, studies, experience, languagesSpoken } = req.body;

    const doctor = await doctorModel.findOne({ doctorID });
    if (!doctor) {
      return res.status(404).json({ message: "Doctorul nu a fost găsit." });
    }

    if (!languagesSpoken || languagesSpoken.length === 0) {
      return res.status(400).json({ message: "Limba română este obligatorie în lista limbilor vorbite." });
    }

    if (!certifications || certifications.length === 0) {
      return res.status(400).json({ message: "Trebuie să adaugi cel puțin o certificare." });
    }

    if (!studies || studies.length === 0) {
      return res.status(400).json({ message: "Trebuie să adaugi cel puțin un studiu." });
    }

    if (!experience || experience.length === 0) {
      return res.status(400).json({ message: "Trebuie să adaugi cel puțin o experiență." });
    }

    const updateFields = {
      certifications,
      studies,
      experience,
      languagesSpoken,
    };

    await doctorModel.updateOne({ doctorID }, { $set: updateFields });

     await logAction({
      actionType: "UPDATE_PROFESSIONAL_INFO",
      description: `Doctorul ${doctorID} și-a schimbat datele profesionale.`,
      userId: doctorID,
      userRole: "doctor",
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: "Informațiile profesionale au fost actualizate cu succes!",
    });

  } catch (error) {
    console.error("Eroare la actualizare date profesionale:", error);
    res.status(500).json({ message: "Eroare la actualizare date profesionale.", error: error.message });
  }
};

const updateDoctorProfileInfo = async (req, res) => {
  const { doctorID } = req.params;
  const { about, expertise, approach, roleInClinic } = req.body;

  try {
    const existingProfile = await doctorProfileModel.findOne({ doctorID });

    if (!existingProfile) {
      return res.status(404).json({ message: "Doctorul nu a fost găsit sau profilul nu există." });
    }

    if (!about?.length || !expertise?.length || !approach?.length || !roleInClinic?.length) {
      return res.status(400).json({ message: "Toate secțiunile trebuie să conțină cel puțin un element." });
    }

    await doctorProfileModel.updateOne(
      { doctorID },
      {
        $set: {
          about,
          expertise,
          approach,
          roleInClinic,
        },
      }
    );

    await logAction({
      actionType: "UPDATE_PROFILE_INFO",
      description: `Doctorul ${doctorID} și-a schimbat datele de profil.`,
      userId: doctorID,
      userRole: "doctor",
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Datele despre profil au fost actualizate cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizarea profilului:", error);
    res.status(500).json({ message: "Eroare la actualizarea profilului.", error: error.message });
  }
};



export {
    updateDoctorPersonalInfo,
    updateDoctorProfessionalInfo,
    updateDoctorProfileInfo,
}