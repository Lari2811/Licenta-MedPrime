import React, { useState } from 'react'
import SidebarDoctor from './SidebarDoctor'
import TopbarDoctor from './TopbarDoctor'

import { useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContex';

import DoctorDashboard from './sections/DoctorDashboard';
import DoctorPersonalInfo from './sections/DoctorPersonalInfo';
import DoctorAppointments from './sections/DoctorAppointments';
import DoctorPatients from './sections/DoctorPatients';
import DoctorFeedback from './sections/DoctorFeedback';
import DoctorSettings from './sections/DoctorSettings';
import DoctorRequests from './sections/DoctorRequests';
import PatientFileInfo from './PatientsFiles/PatientFileInfo';



const DoctorMainPage = () => {

    const location = useLocation();

    const { doctorID, section, subsection } = useParams(); 

    const [isCollapsed, setIsCollapsed] = useState(false);

     const renderSection = () => {
        switch (section) {
          case "dashboard":
            return <DoctorDashboard />;
    
          case "informatii-personale":
            return <DoctorPersonalInfo />
    
          case "programarile-mele":
            return <DoctorAppointments />;
    
          case "dosare-pacienti":
            return subsection ? (
              <PatientFileInfo />

             ) : (
              <DoctorPatients />
             );
    
          case "feedback":
            return <DoctorFeedback />;

          case "setari":
            return <DoctorSettings />;

            case "solicitarile-mele": 
            return <DoctorRequests />;
         
          default:
            return <div className="p-6 text-red-600">Secțiune necunoscută</div>;
        }
      };
  

  return (
     <div className="bg-purple-50 min-h-screen">
      <SidebarDoctor isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      {/* Conținut principal */}
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
          <TopbarDoctor />
          <div>{renderSection()}</div>
        </div>
    </div>
  )
}

export default DoctorMainPage