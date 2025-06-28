import locationModel from '../../../models/locationModel.js';
import logAction from '../../../utils/logAction.js'; // import log-ul tău
import cloudinary from '../../../utils/cloudinary.js';
import { io } from '../../../server.js'; 

const generateLocationID = async () => {
  const lastLocation = await locationModel
    .findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!lastLocation || !lastLocation.locationID) {
    return 'L001';
  }

  const lastNumber = parseInt(lastLocation.locationID.replace('L', '')) || 0;
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `L${newNumber}`;
};

export const addLocation = async (req, res) => {
  try {
  
    const { locationDataForm, adminID } = req.body;

    const parsedData = JSON.parse(locationDataForm);

      const existingLocation = await locationModel.findOne({
        name: { $regex: new RegExp(`^${parsedData.clinicName}$`, 'i') } 
      });
  
      if (existingLocation) {
        return res.status(400).json({ message: `Locația cu numele "${parsedData.clinicName}" există deja!` });
      }

    const locationID = await generateLocationID();

    let profileImageUrl = '';
    if (req.files['profileImage'] && req.files['profileImage'][0]) {
      profileImageUrl = req.files['profileImage'][0].path;
    }

    let galleryUrls = [];
    if (req.files['galleryImages'] && req.files['galleryImages'].length > 0) {
      galleryUrls = req.files['galleryImages'].map((file) => file.path);
    }

    const newLocation = await locationModel.create({
      locationID,
      clinicName: parsedData.clinicName || '',
      phone: parsedData.phone || '',
      email: parsedData.email || '',
      status: parsedData.status || '',
      isLocationActive: parsedData.isLocationActive !== undefined ? parsedData.isLocationActive : true,
      address: {
        city: parsedData.address.city || '',
        county: parsedData.address.county || '',
        address_details: parsedData.address.address_details || '',
        postalCode: parsedData.address.postalCode || '',
        latitude: parsedData.address.latitude || null,
        longitude: parsedData.address.longitude || null,
      },
      infoProfile: parsedData.infoProfile || '',
      otherInformations: parsedData.otherInformations || [],
      facilities: parsedData.facilities || [],
      schedule: parsedData.schedule || [],
      images: {
        profileImage: profileImageUrl,
        gallery: galleryUrls,
      },
      closedReason: parsedData.closedReason || '',
      reopenDate: parsedData.reopenDate || '',
      isSpecialitiesSetupCompleted: false,
      isInvestifationsSetupCompleted: false
    });

   
    await logAction({
        actionType: 'ADD_LOCATION',
        description: `Adminul ${adminID} a adăugat o nouă locație cu ID-ul ${locationID}.`,
        userId: adminID,
        userRole: 'admin',
        ipAddress: req.ip,
        details: {
            locationID: locationID,
            clinicName: parsedData.clinicName,
            county: parsedData.address?.county,
            Status: parsedData.status,
            isLocationActive: parsedData.isLocationActive,
        },
        });

    io.emit('locationAdded', {
        message: `Locația ${locationID} a fost adăugată!`,
        locationID: locationID,
        location: newLocation, 
    });

    res.status(201).json({
      success: true,
      message: `Locația ${locationID} a fost adăugată cu succes!`,
      location: newLocation,
    });



  } catch (error) {
    console.error('Eroare la adăugarea locației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la adăugarea locației.',
      error: error.message,
    });
  }
};
