import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useState } from "react";
import { assets } from '../../assets/assets';
import {
  faBars,
  faCalendarAlt,
  faCogs,
  faCommentDots,
  faExclamationCircle,
  faFolderOpen,
  faGauge,
  faSignOutAlt,
  faUserDoctor
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppContext } from "../../context/AppContex";

const SidebarDoctor = ({isCollapsed, setIsCollapsed}) => {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorID } = useParams();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 

  const handleConfirmLogout = () => {
    sessionStorage.setItem("logoutReason", "manual");
    logout();
    setShowLogoutConfirm(false);
    navigate("/autentificare");
  };

  const menuItems = [
    { label: "Dashboard", icon: faGauge, path: "dashboard" },
    { label: "Informații Personale", icon: faUserDoctor, path: "informatii-personale" },
    { label: "Programările Mele", icon: faCalendarAlt, path: "programarile-mele" },
    { label: "Dosare Pacienți", icon: faFolderOpen, path: "dosare-pacienti" },
    { label: "Feedback", icon: faCommentDots, path: "feedback" },
    { label: "Solicitările mele", icon: faExclamationCircle, path: "solicitarile-mele" },
    { label: "Setări", icon: faCogs, path: "setari" },
  ];

  return (
    <div className={`${isCollapsed ? "w-16" : "w-64"} fixed top-0 left-0 bottom-0 z-40 bg-purple-100 shadow-lg transition-all duration-300`}>
      
      {/* Header sidebar: logo + buton pliere */}
      <div className="flex items-center text-center justify-between px-3 py-2 border-b-2 border-purple-200">
        <div className="flex items-center gap-3">
          <img src={assets.logo} alt="Logo" className="w-12 md:w-14 rounded-[20px]" />
          {!isCollapsed && (
            <div className="leading-tight">
              <h1 className="text-base md:text-lg font-semibold text-[#333]">MED PRIME</h1>
              <p className="text-sm text-[#666]">Medic</p>
            </div>
          )}
        </div>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-purple-800 hover:text-purple-600 transition">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      </div>


      {/* Meniu */}
      <nav className="mt-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <NavLink
                to={`/profil-medic/${doctorID}/${item.path}`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 ${
                    isActive ? "bg-purple-200 border-l-5 border-purple-600" : "hover:bg-purple-200"
                  } cursor-pointer whitespace-nowrap !rounded-button`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="mr-3 text-purple-700" />
                {!isCollapsed && <span className="text-purple-800">{item.label}</span>}
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
          {!isCollapsed && <span className="text-purple-800">Deconectare</span>}
        </button>
      </div>

      {/* Confirmare logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmare deconectare</h3>
            <p className="text-gray-600 mb-6">Ești sigur că vrei să te deconectezi?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Anulează
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                onClick={handleConfirmLogout}
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarDoctor;
