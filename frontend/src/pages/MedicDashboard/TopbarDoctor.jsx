import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCalendarAlt, faCalendarCheck, faCalendarDay, faCalendarDays, faChartBar, faClipboardList, faCog, faExclamationCircle, faHouse, faMapMarkerAlt, faStethoscope, faTachometerAlt, faTools, faUser, faUserMd, faUsers, faVial } from "@fortawesome/free-solid-svg-icons";
import { faCogs, faCommentDots, faFolderOpen, faGauge, faSignOutAlt, faUserCircle, faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContex";
import axios from "axios";

const TopbarDoctor = () => {

     const { section, doctorID, subsection } = useParams();

     const {backendUrl} = useContext(AppContext);
      const[doctorData , setDoctorData ] = useState([])

      const fetchDoctor = async () => {
        if (!doctorID) {
          console.error('Introdu un doctorID!');
          return;
        }

        try {
          const response = await axios.post(`${backendUrl}/api/doctor/get-doctor-by-id`, {
            doctorID: doctorID
          });

          if (response.data.success) {
            setDoctorData(response.data.data);
             console.log("Doctor: ", response.data.data);
          } else {
            setDoctorData(null);
            console.error(response.data.message || 'Eroare necunoscută.');
          }
        } catch (err) {
          console.error(err);
          setDoctorData(null);
          console.error('Eroare la conectarea cu serverul.');
        }
      };

      useEffect(() => {
        fetchDoctor();
      }, [doctorID]);


     const getBreadcrumb = () => {
           const sectionNames = {
            dashboard: { name: "Dashboard", icon: faTachometerAlt },
            "informatii-personale": { name: "Informații Personale", icon: faUserDoctor },
            "programarile-mele": { name: "Programările Mele", icon: faCalendarAlt },
            "dosare-pacienti": { name: "Dosare Pacienți", icon: faFolderOpen },
            feedback: { name: "Feedback", icon: faCommentDots },
            "solicitarile-mele": { name: "Solicitările Mele", icon: faExclamationCircle },
            setari: { name: "Setări", icon: faCog }
            };
     
           const isLastSection = !subsection;
     
           return section ? (
             <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-base mb-1 mt-1">
               {/* Acasa */}
               <Link
                 to={`/profil-medic/${doctorID}/dashboard`}
                 className="flex items-center text-gray-500 hover:text-purple-600 hover:underline transition"
               >
                 <FontAwesomeIcon icon={faHouse} />
                 <span className="ml-1">Acasă</span>
               </Link>
     
               <span className="text-gray-400">{'>'}</span>
     
               {/* Section  */}
               {isLastSection ? (
                 <span className="text-purple-600 underline font-medium flex items-center">
                   <FontAwesomeIcon icon={sectionNames[section]?.icon} className="mr-1" />
                   <span>{sectionNames[section]?.name || section}</span>
                 </span>
               ) : (
                 <Link
                   to={`/profil-medic/${doctorID}/${section}`}
                   className="flex items-center text-gray-500 hover:text-purple-600 hover:underline transition"
                 >
                   <FontAwesomeIcon icon={sectionNames[section]?.icon} className="mr-1" />
                   <span>{sectionNames[section]?.name || section}</span>
                 </Link>
               )}
     
               {/* Subsection  */}
               {subsection && (
                 <>
                   <span className="text-gray-400">{'>'}</span>
                   <span className="text-purple-600 underline font-medium capitalize">
                     {subsection}
                   </span>
                 </>
               )}
             </nav>
           ) : (
             <Link
               to="/profil-medic"
               className="text-gray-700 hover:text-purple-600 transition-colors"
             >
               Acasă
             </Link>
           );
         };

  return (
    <div className="flex items-center justify-between bg-purple-50 px-6 py-3 shadow-md mb-1">
      {/* Left: Breadcrumb */}
      <div className="">{getBreadcrumb()}</div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-6">
        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-90">
          <img
            src={doctorData.profileImage || assets.user_default}
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="text-sm text-gray-700 font-medium"> Dr. {doctorData.lastName} {doctorData.firstName} </span>
        </div>
      </div>
    </div>
  );
}

export default TopbarDoctor