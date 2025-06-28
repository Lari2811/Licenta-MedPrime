import { NavLink, useLocation, useParams } from "react-router-dom";
import {  faGauge, faUserDoctor, faUsers, faCalendarAlt, faStethoscope, faMapMarkerAlt,
  faToolbox, faVial, faChartLine, faCogs, faSignOutAlt,
  faClipboardList,
  faTasks
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContex";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

const SidebarAdmin = () => {

    const { logout } = useContext(AppContext);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const location = useLocation();
    const { adminID } = useParams();
    const currentPath = location.pathname;

    const menuItems = [
      { label: "Dashboard", icon: faGauge, path: "dashboard" },
      { label: "Medici", icon: faUserDoctor, path: "medici" },
      { label: "Pacienți", icon: faUsers, path: "pacienti" },
      { label: "Programări", icon: faCalendarAlt, path: "programari" },
      { label: "Specialități", icon: faStethoscope, path: "specialitati" },
      { label: "Locații", icon: faMapMarkerAlt, path: "locatii" },
      { label: "Investigații", icon: faVial, path: "investigatii" },
      { label: "Setări", icon: faCogs, path: "setari" },
      { label: "Backlog cereri", icon: faClipboardList, path: "backlog-cereri" },
      { label: "Cererile mele", icon: faTasks, path: "cererile-mele" },
    ];

    const handleConfirmLogout = () => {
      sessionStorage.setItem("logoutReason", "manual");
      logout();
      setShowLogoutConfirm(false);
      navigate("/autentificare");
    };

  return (
   <div className="w-16 md:w-64 fixed top-0 left-0 bottom-0 z-40 bg-purple-100 shadow-lg flex flex-col">

      {/* Logo și titlu */}
      <div className="p-3 border-b-2 border-purple-200">
        <div className="flex items-center gap-3 ml-2 mr-2">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-12 md:w-14 rounded-[20px]"
          />
          <div className="hidden md:block leading-tight text-center">
            <h1 className="text-base md:text-lg font-semibold text-[#333]">
              MED PRIME
            </h1>
            <p className="text-sm text-[#666]">Administrator</p>
          </div>
        </div>
      </div>

      {/* Meniu */}
       <nav className="mt-1 flex-1 overflow-y-auto">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <NavLink
                to={`/admin/${adminID}/${item.path}`}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-3 text-left ${
                    isActive
                      ? "bg-purple-200 border-l-5 border-purple-600"
                      : "hover:bg-purple-200"
                  } cursor-pointer whitespace-nowrap !rounded-button`
                }
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="mr-3 text-purple-700"
                />
                <span className="text-purple-800 hidden md:inline">
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Deconectare */}
      <div className="mt-6 border-purple-200 border-t-2 border-b-2 pt-1 pb-1">
       <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded cursor-pointer whitespace-nowrap !rounded-button"
        >
        <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
        <span className="text-purple-800 hidden md:inline">
          Deconectare
        </span>
        </button>

      </div>

    {showLogoutConfirm && (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
        <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmare deconectare</h3>
        <p className="text-gray-600 mb-6">
          Ești sigur că vrei să te deconectezi?
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md cursor-pointer"
            onClick={() => setShowLogoutConfirm(false)}
          >
            Nu
          </button>
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer"
            onClick={handleConfirmLogout}
          >
            Da
          </button>
        </div>
      </div>
    </div>
)}

    </div>
  );
};

export default SidebarAdmin;
