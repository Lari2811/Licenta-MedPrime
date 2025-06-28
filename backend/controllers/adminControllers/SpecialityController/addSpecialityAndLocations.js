import specialityLocationModel from "../../../models/specialityLocationModel.js";
import specialityModel from "../../../models/specialityModel.js";
import logAction from '../../../utils/logAction.js'; // import log-ul tău
import cloudinary from '../../../utils/cloudinary.js';
import { io } from '../../../server.js'; 

const generateSpecialityID = async () => {
  const last = await specialityModel.findOne({}).sort({ createdAt: -1 }).lean();
  if (!last || !last.specialityID) return 'SP001';

  const nr = parseInt(last.specialityID.replace('SP', '')) || 0;
  return 'SP' + (nr + 1).toString().padStart(3, '0');
};

export const addSpecialityAndLocations = async (req, res) => {
  try {
    const { adminID, formData, selectedLocations } = req.body;

    if (req.files) {
      console.log("Fișiere încărcate:", req.files);
    }

    let parsedFormData = formData;
    let parsedSelectedLocations = selectedLocations;

    if (typeof formData === 'string') {
    parsedFormData = JSON.parse(formData);
    }

    if (typeof selectedLocations === 'string') {
    parsedSelectedLocations = JSON.parse(selectedLocations);
    }


    if (!formData || !selectedLocations || !adminID) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }

    const existingSpeciality = await specialityModel.findOne({
      name: { $regex: new RegExp(`^${parsedFormData.name}$`, 'i') } // insensitive la case
    });

    if (existingSpeciality) {
      return res.status(400).json({ message: `Specialitatea cu numele "${parsedFormData.name}" există deja!` });
    }

    const newSpecialityID = await generateSpecialityID();

    let profileImageUrl = '';
    if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
      profileImageUrl = req.files['profileImage'][0].path;
    }

    const newSpeciality = await specialityModel.create({
        specialityID: newSpecialityID,
        name: parsedFormData.name || "",
        shortDescription: parsedFormData.shortDescription || "",
        otherInfo: parsedFormData.otherInfo || [],
        reasonsToConsult: parsedFormData.reasonsToConsult || [],
        consultationBenefits: parsedFormData.consultationBenefits || [],
        faq: parsedFormData.faq || [],
        profileImage: profileImageUrl
    });


    await logAction({
        actionType: 'ADD_SPECIALITY',
        description: `Adminul ${adminID} a adăugat o nouă specialitate cu ID-ul ${newSpecialityID}.`,
        userId: adminID,
        userRole: 'admin',
        ipAddress: req.ip,
        details: {
            specialityID: newSpecialityID,
            name: formData.name,
        },
        });

    io.emit('ADD_SPECIALITY_LOC', {
      message: `Specialitatea ${newSpecialityID} a fost adăugată!`,
      specialityID: newSpecialityID,
      speciality: newSpeciality
    });

    let locationResults = [];
    if (selectedLocations.length > 0) {
        const locationsToInsert = parsedSelectedLocations.map(loc => ({
          specialityID: newSpecialityID,
          specialityName: parsedFormData.name,
          locationID: loc.locationID,
          locationClinicName: loc.locationClinicName,
          isActive: loc.isActive !== undefined ? loc.isActive : true,
          locationStatus: loc.status || 'necunoscut',
          locationReopenDate: loc.reopenDate || null
      }));

      locationResults = await specialityLocationModel.insertMany(locationsToInsert);

      await logAction({
          actionType: 'ADD_SPECIALITY_LOCATIONS',
          description: `Adminul ${adminID} a adăugat ${locationResults.length} locații pentru specialitatea ${newSpecialityID}.`,
          userId: adminID,
          userRole: 'admin',
          ipAddress: req.ip,
          details: {
              specialityID: newSpecialityID,
              locations: locationResults.map(loc => ({
              locationID: loc.locationID,
              clinicName: loc.locationClinicName,
              isActive: loc.isActive
              })),
          },
      }); 

      io.emit('ADD_SPECIALITY_LOC', {
          message: `Au fost adăugate locații pentru specialitatea ${newSpecialityID}.`,
          specialityID: newSpecialityID,
          locations: locationResults
      });
    }

    res.status(201).json({
      message: "Specialitate și locații salvate cu succes!",
      specialityID: newSpecialityID,
      locations: locationResults
    });

  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la adăugarea specialității și locațiilor!" });
  }
};
