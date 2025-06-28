
import { useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContex';
import PatientInfoSection from "./PatientInfo/PatientInfoSection";
import PatientAppSection from "./PatientAppointments/PatientAppSection";
import PatientMedicalHistorySection from "./PatientMedicalHistory/PatientMedicalHistorySection";
import PatientFeedbackSection from "./PatientFeedback/PatientFeedbackSection";
import PatientSettingsSection from "./PatientSettings/PatientSettingsSection";
import PatientReqSection from "./PatientRequests/PatientReqSection";
import PatientNewAppointment from "./PatientAppointments/PatientNewAppointment";

const PatientMainPage = () => {

  const location = useLocation();

  const { patientName, section, subsection } = useParams();  //from URL -> same like App.jsx

   const renderSection = () => {
        switch (section) {
          case "informatii-personale":
            
            return <PatientInfoSection />
    
          case "programarile-mele":
            return subsection ? (
              <PatientNewAppointment locationName={subsection} />
            ) : ( 
              <PatientAppSection />
            );
    
          case "istoric-medical":
            return <PatientMedicalHistorySection />;
    
          
          case "feedback":
            return <PatientFeedbackSection />;

          case "setari":
            return <PatientSettingsSection />;

            case "solicitarile-mele": 
            return <PatientReqSection />;
         
          default:
            return <div className="p-6 text-red-600">Secțiune necunoscută</div>;
        }
      };

  return (
    
    <div className="">
        {renderSection()} 
    </div>
  )
}

export default PatientMainPage