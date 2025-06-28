import React from 'react'
import SidebarAdmin from './SidebarAdmin'
import TopbarAdmin from './TopbarAdmin'

import { useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContex';

import AdminDashboard from "./sections/AdminDashboard"
import AdminDoctors from "./sections/AdminDoctors"
import AdminPatients from "./sections/AdminPatiens"
import AdminAppointments from "./sections/AdminAppointments"
import AdminSpecialities from "./sections/AdminSpecialities"
import AdminLocations from "./sections/AdminLocations"
import AdminInvestigations from "./sections/AdminInvestigations"
import AdminRaportsAndStatistics from "./sections/AdminRaportsAndStatistics"
import AdminSettings from "./sections/AdminSettings"

import AdminBacklogReq from './sections/AdminBacklogReq';
import AdminRequests from './sections/AdminRequests';

const AdminMainPage = () => {

  const { aToken, setAToken, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const { adminName, section, subsection } = useParams(); // luat din URL
  
  const location = useLocation();

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <AdminDashboard />;

      case "medici":
        return <AdminDoctors />;

      case "pacienti":
        return <AdminPatients />;

      case "programari":
        return <AdminAppointments />;

      case "specialitati":
        return <AdminSpecialities/>;
        

      case "locatii":
        return <AdminLocations/>;
       
    
      case "investigatii":
        return <AdminInvestigations/>;
      
      
      case "rapoarte":
        return <AdminRaportsAndStatistics/>;

      case "setari":
        return <AdminSettings />;

      case "backlog-cereri":
        return <AdminBacklogReq />;

      case "cererile-mele":
        return <AdminRequests />;
     
      default:
        return <div className="p-6 text-red-600">Secțiune necunoscută</div>;
    }
  };
  
  return (
    <div className="bg-purple-50 min-h-screen">
      <SidebarAdmin />
        <div className="flex-1 bg-gray-50 md:ml-64 ml-16">
        <TopbarAdmin />
        </div>
        

      <div className="flex-1 ml-16 md:ml-64 p-6">
        {renderSection()}
      </div>
      
        
    </div>
  )
}

export default AdminMainPage