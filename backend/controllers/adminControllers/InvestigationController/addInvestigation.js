import investigationModel from '../../../models/investigationModel.js';
import logAction from '../../../utils/logAction.js'; // import log-ul tău
import cloudinary from '../../../utils/cloudinary.js';
import { io } from '../../../server.js'; 

const generateInvestigationID = async () => {
  const last = await investigationModel.findOne({}).sort({ createdAt: -1 }).lean();
  if (!last || !last.investigationID) return 'INV001';

  const nr = parseInt(last.investigationID.replace('INV', '')) || 0;
  return 'INV' + (nr + 1).toString().padStart(3, '0');
};


export const addInvestigation = async (req, res) => {
  try {
    const { adminID, formData } = req.body;

    if (req.files) {
      console.log("Fișiere încărcate:", req.files);
    }

    let parsedFormData = formData;

    if (typeof formData === 'string') {
        parsedFormData = JSON.parse(formData);
    }

   
    
    if (!formData || !adminID) {
      return res.status(400).json({ message: "Date incomplete transmise!" });
    }

    const existingInvestigation = await investigationModel.findOne({
      name: { $regex: new RegExp(`^${parsedFormData.name}$`, 'i') } // insensitive la case
    });

    if (existingInvestigation) {
      return res.status(400).json({ message: `Investigația cu numele "${parsedFormData.name}" există deja!` });
    }

    const newInvestigationID = await generateInvestigationID();

    //  procesare imaginea
    let profileImageUrl = '';
    if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
      profileImageUrl = req.files['profileImage'][0].path;
    }

    const numberOfSlots = parseInt(parsedFormData.numberOfSlots);
    const duration = numberOfSlots * 15;

    const newInvestigation = await investigationModel.create({
      investigationID: newInvestigationID,
      name: parsedFormData.name || "",
      shortDescription: parsedFormData.shortDescription || "",
      numberOfSlots: numberOfSlots || 0,
      duration: duration || 0,
      requiresDoctor: parsedFormData.requiresDoctor || true,
      consultationSteps: parsedFormData.consultationSteps || [],
      preparationTips: parsedFormData.preparationTips || [],
      faq: parsedFormData.faq || [],
      profileImage: profileImageUrl,
    });


    await logAction({
        actionType: 'ADD_INVESTIGATION',
        description: `Adminul ${adminID} a adăugat o nouă investigație cu ID-ul ${newInvestigationID}.`,
        userId: adminID,
        userRole: 'admin',
        ipAddress: req.ip,
        details: {
            investigationID: newInvestigationID,
            name: formData.name,
        },
        });

    io.emit('investigationAdded', {
      message: `Investigația ${newInvestigationID} a fost adăugată!`,
      investigationID: newInvestigationID,
      investigation: newInvestigation
    });

    console.log("Investigația adaugata cu succes!!!")

    res.status(201).json({
    message: "Investigația adăugată cu succes!",
    investigationID: newInvestigationID,
    investigation: newInvestigation
    });

           
  } catch (error) {
    console.error("Eroare la salvare:", error);
    res.status(500).json({ message: "Eroare la adăugarea investigației!" });
  }
};
