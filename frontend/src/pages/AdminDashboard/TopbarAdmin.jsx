import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCalendarAlt, faCalendarCheck, faCalendarDay, faCalendarDays, faChartBar, faClipboardList, faCog, faHouse, faMapMarkerAlt, faStethoscope, faTachometerAlt, faTasks, faTools, faUser, faUserMd, faUsers, faVial } from "@fortawesome/free-solid-svg-icons";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContex";
import axios from "axios";

const TopbarAdmin = () => {
  const { section, adminID, subsection } = useParams();
  const {backendUrl} = useContext(AppContext);
  const[adminData, setAdminData] = useState([])

  const fetchAdmin = async () => {
    if (!adminID) {
      console.error('Introdu un adminID!');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/admin/get-admin-by-id`, {
        adminID: adminID
      });

      if (response.data.success) {
        setAdminData(response.data.data);
        //console.log("Admin: " , response.data.data)
      } else {
        setAdminData(null);
        console.error(response.data.message || 'Eroare necunoscută.');
      }
    } catch (err) {
      console.error(err);
      setAdminData(null);
      console.error('Eroare la conectarea cu serverul.');
    }
  };


 useEffect(() => {
    fetchAdmin()
  }, []);

    const getBreadcrumb = () => {
      const sectionNames = {
        medici: { name: "Medici", icon: faUserMd },
        pacienti: { name: "Pacienți", icon: faUsers },
        specialitati: { name: "Specialități", icon: faStethoscope },
        programari: { name: "Programări", icon: faCalendarDays },
        locatii: { name: "Locații", icon: faMapMarkerAlt },
        echipamente: { name: "Echipamente", icon: faTools },
        investigatii: { name: "Investigații", icon: faVial },
        rapoarte: { name: "Rapoarte", icon: faChartBar },
        dashboard: { name: "Dashboard", icon: faTachometerAlt },
        setari: { name: "Setări", icon: faCog },
        "backlog-cereri": { name: "Backlog Cereri", icon: faClipboardList },
        "cererile-mele": { name: "Cererile Mele", icon: faTasks },
      };

      const isLastSection = !subsection;

      return section ? (
        <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-base mb-1 mt-1">
          {/* Acasa */}
          <Link
            to={`/admin/${adminID}/dashboard`}
            className="flex items-center text-gray-500 hover:text-purple-600 hover:underline transition"
          >
            <FontAwesomeIcon icon={faHouse} />
            <span className="ml-1">Acasă</span>
          </Link>

          <span className="text-gray-400">{'>'}</span>

          {/* Section */}
          {isLastSection ? (
            <span className="text-purple-600 underline font-medium flex items-center">
              <FontAwesomeIcon icon={sectionNames[section]?.icon} className="mr-1" />
              <span>{sectionNames[section]?.name || section}</span>
            </span>
          ) : (
            <Link
              to={`/admin/${adminID}/${section}`}
              className="flex items-center text-gray-500 hover:text-purple-600 hover:underline transition"
            >
              <FontAwesomeIcon icon={sectionNames[section]?.icon} className="mr-1" />
              <span>{sectionNames[section]?.name || section}</span>
            </Link>
          )}

          {/* Subsection */}
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
          to="/admin"
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
            src={adminData.profileImage || assets.user_default}
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="text-sm text-gray-700 font-medium"> {adminData.lastName} {adminData.firstName} </span>
          
        </div>
      </div>
    </div>
  );
};

export default TopbarAdmin;
