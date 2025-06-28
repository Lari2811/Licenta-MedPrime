import doctorModel from "../../models/doctorModel.js";
import doctorProfileModel from "../../models/doctorProfileModel.js";
import userModel from "../../models/userModel.js";


export const updateAllDoctorProfile = async (req, res) => {
  const { doctorID } = req.params;

    //console.log("=== PRIMIM CEREREA ===");
    //console.log("doctorID:", doctorID);
    //console.log("req.body:", req.body);
    //console.log("req.file:", req.file);


  const doctorDataForm = JSON.parse(req.body.doctorDataForm);
  const doctorDataProfileForm = JSON.parse(req.body.doctorDataProfileForm);
  const newPassword = req.body.newPassword;
  const profileImageFile = req.file;

    //console.log("=====================");
    //console.log("doctorDataForm:", doctorDataForm);
    //console.log("doctorDataProfileForm:", doctorDataProfileForm);
    //console.log("newPassword:", newPassword);

  try {
    

    if (profileImageFile) {
      doctorDataForm.profileImage = profileImageFile.path; // sau .url
    }

    delete doctorDataForm.doctorID;

    // Update doctorModel
    await doctorModel.updateOne(
      { doctorID },
      { $set: { ...doctorDataForm } }
    );

    // Update doctorProfileModel
    const profileExists = await doctorProfileModel.findOne({ doctorID });
    if (profileExists) {
      await doctorProfileModel.updateOne(
        { doctorID },
        { $set: { ...doctorDataProfileForm } }
      );
    } else {
      await doctorProfileModel.create({
        doctorID,
        ...doctorDataProfileForm,
      });
    }

    // Update userModel (parola + mustCompleteProfile)
    if (newPassword) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updateOne(
        { linkedID: doctorID },
        { $set: { 
          password: hashedPassword, 
          mustCompleteProfile: false,
          isActive: true,
        } }
      );
    } else {
      await userModel.updateOne(
        { linkedID: doctorID },
        { $set: { 
            mustCompleteProfile: false,
            isActive: true,
          } 
        }
      );
    }

    res.status(200).json({ message: "Profil actualizat cu succes!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea profilului.", error: error.message });
  }
};

