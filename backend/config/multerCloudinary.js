import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import sanitizeFilename from '../utils/sanitizeFilename.js';

// Functie care decide folderul in functie de route sau body
const getFolderFromRequest = (req) => {
  const url = req.originalUrl.toLowerCase(); 
  if (url.includes('location')) return 'medprime/locations';
  if (url.includes('doctor')) return 'medprime/doctors';
  if (url.includes('patient')) return 'medprime/patients';
  if (url.includes('specialit')) return 'medprime/specialities';
  if (url.includes('investigation')) return 'medprime/investigations';
  if (url.includes('patient')) return 'medprime/patients';
  return 'medprime/others';
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = getFolderFromRequest(req);

    console.log("ORIGINAL FILE NAME:", file.originalname);

    const sanitized = sanitizeFilename(file.originalname.split('.')[0]);

    console.log("SANITIZED FILE NAME:", sanitized);

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      public_id: `${Date.now()}-${sanitized}`,
    };
  },

});

const upload = multer({ storage });




export default upload;
