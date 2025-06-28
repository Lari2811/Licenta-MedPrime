import axios from 'axios';
import { toast } from 'react-toastify';

export const formatName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-"); 
};

export const getPatientFullName = async (patientID, backendUrl) => {
  if (!patientID) return null;

  try {
    const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);
    const data = response.data;

    if (response.status === 200 && data.success) {
      const { firstName, lastName } = data.data;
      const fullName = `${lastName} ${firstName}`; 
      return formatName(fullName);  
    } else {
      toast.error(data.message || "Pacientul nu a fost găsit.");
      return null;
    }
  } catch (error) {
    console.error("Eroare la obținerea numelui pacientului:", error);
    toast.error("Eroare la obținerea numelui pacientului.");
    return null;
  }
};
