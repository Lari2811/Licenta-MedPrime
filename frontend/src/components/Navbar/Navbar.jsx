    import React, { useState, useRef, useEffect, useContext } from 'react';
    import { assets } from '../../assets/assets'
    import { NavLink, useNavigate } from 'react-router-dom'

    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
    import { faBars, faClipboard, faCommentDots, faGear, faHandshake, faHistory, faRightToBracket, faSun, faUser, faUserMd, faWheelchairMove } from '@fortawesome/free-solid-svg-icons';
    import { toast } from "react-toastify";
    import 'react-toastify/dist/ReactToastify.css';
    import axios from 'axios'
    import { useParams } from 'react-router-dom';
          
    import './Navbar.css'
    import { AppContext } from '../../context/AppContex';

    const Navbar = () => {


      const navigate = useNavigate()
      const { logout, backendUrl } = useContext(AppContext)
      const [patientData, setPatientData] = useState([])

      const [loading, setLoading] = useState(false);
      const [loadingMessage, setLoadingMessage] = useState("");
      const [patientID, setPatientID] = useState("");
      const [showMenu, setShowMenu] = useState(false);

      const [token, setToken] = useState(false);
      const [showLogoutModal, setShowLogoutModal] = useState(false);
      const [dropdownOpen, setDropdownOpen] = useState(false);

      const [userName, setUserName ] = useState();
      const dropdownRef = useRef(null);
      const [isProfileComplete, setIsProfileComplete] = useState(true);

      const handleNavClick = (path) => {
      if (location.pathname === path) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Dacă vrei și un reload complet:
        // window.location.reload();
      }
     }

      const getPatientIDFromToken = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          return decoded.linkedID;
        }
        return null;
      };

      const patientMenuItems = [
        { label: "Profilul meu", icon: faUser, path: "informatii-personale" },
        { label: "Programările mele", icon: faClipboard, path: "programarile-mele" },
        { label: "Istoric medical", icon: faHistory, path: "istoric-medical" },
        { label: "Feedback", icon: faCommentDots, path: "feedback" },
        { label: "Setări", icon: faGear, path: "setari" },
      ];

      //API get patient data by id
      const fetchPatient = async () => {
      try {
        setLoading(false);
        setLoadingMessage("Încărcare date pacient...");

        const token = localStorage.getItem("authToken");
        let patientID = null;
        let role = null;

        if (token) {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          patientID = decoded.linkedID;
          role = decoded.role;
        }

        if ( (role !== "patient")) {
          //toast.error("ID pacient inexistent. Reautentifică-te!");
          setToken(false)
          return;
        }

        
        const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);
        const status = response.status;
        const data = response.data;

        //console.log("Pacient data: ", data);

        if (status === 200 && data.success) {
          setPatientData(data.data);
          //toast.success(data.message || "Datele pacientului au fost încărcate cu succes!");
        } else if (status === 404) {
          toast.error(data.message || "Pacientul nu a fost găsit.");
        } else {
          toast.error(data.message || "Eroare necunoscută.");
        }

      } catch (error) {
        console.error("Eroare API:", error);
        toast.error("Eroare la încărcarea datelor pacientului.");
      } finally {
        setLoading(false);
      }
    };


    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setToken(false);
          return;
        }

        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userID = decoded.linkedID;
        const role = decoded.role;

    

        if ( (role !== "patient")) 
          {
            setToken(false);
            return;
          }

        const response = await axios.get(`${backendUrl}/api/main/get-user-by-ID/${userID}`);
        if (!response.data.success) {
          toast.error("Eroare la verificarea contului.");
          setToken(false);
          return;
        }

        const userData = response.data.data;

        if (userData.mustCompleteProfile) 
          {
            setToken(false); 
           // toast.error("false")
          } else {
            setToken(true); 
           //toast.error("true")
          }
        
      } catch (error) {
        console.error("Eroare profil:", error);
        toast.error("Eroare la verificarea profilului.");
        setToken(false);
      }
    };



    useEffect(() => {
      if (patientID) {
        fetchPatient();
      }
    }, [patientID]);
            
    useEffect(() => {
          const handleClickOutside = (event) => {
            if (
              dropdownRef.current &&
              !dropdownRef.current.contains(event.target)
            ) {
              setDropdownOpen(false);
            }
          };
        
          // Adaugă ascultători doar dacă meniul e deschis
          if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
          }
        
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
          };
    }, [dropdownOpen]);

    
    useEffect(() => {
      checkProfileCompletion();
    }, []);

    useEffect(() => {
      const id = getPatientIDFromToken();
      if (id) {
        setPatientID(id);
      }
    }, []);

    //data updated
    useEffect(() => {
      const checkForPatientUpdate = () => {
        const flag = localStorage.getItem("NavbarRefresh");
        if (flag === "true") {
          fetchPatient(); 
          localStorage.removeItem("NavbarRefresh"); 
        }
      };

      // Check imediat la mount
      checkForPatientUpdate();

      // Și apoi la fiecare 2-3 secunde, ca să fie reactiv
      const interval = setInterval(checkForPatientUpdate, 2000); // sau cât vrei

      return () => clearInterval(interval);
    }, []);




    return (
    <div className="navbar-container w-full flex items-center justify-between text-sm py-4 border-b border-b-gray-400 rounded-b-2xl mt-0 mb-4">

    {/* Logo */}
    <div className="flex items-center gap-3 cursor-pointer ml-2 mr-2" >
    <NavLink to="/" onClick={() => handleNavClick('/')}>
        <img
          src={assets.logo}
          alt="Logo"
          className="w-12 md:w-15 rounded-[20px]"
        />
        </NavLink>
        
        <div className="text-center leading-tight">
        <NavLink to="/" onClick={() => handleNavClick('/')}>
          <h1 className="text-base md:text-lg font-semibold text-[#333]">MED PRIME</h1>
          {token && <p className="text-xs text-[#666]">Contul Meu</p>}
          
          </NavLink>
        </div>
        

      </div>
     
      {/* Meniu */}
    <ul className="md:flex items-start gap-5 text-sm font-medium hidden">
        <NavLink to="/" onClick={() => handleNavClick('/')} className="nav-box">ACASĂ</NavLink>
        <NavLink to="/despre-noi" onClick={() => handleNavClick('/despre-noi')} className="nav-box">DESPRE NOI</NavLink>
        <NavLink to="/locatii" onClick={() => handleNavClick('/locatii')} className="nav-box">LOCAŢII</NavLink>
        <NavLink to="/medici" onClick={() => handleNavClick('/medici')} className="nav-box">MEDICI</NavLink>
        <NavLink to="/specialitati" onClick={() => handleNavClick('/specialitati')} className="nav-box">SPECIALITĂȚI</NavLink>
        <NavLink to="/donare" onClick={() => handleNavClick('/donare')} className="nav-box">DONARE</NavLink>
        <NavLink to="/contact" onClick={() => handleNavClick('/contact')} className="nav-box">CONTACT</NavLink>
    </ul>

     {/* User */}
     <div className="flex items-center gap-4 mr-2">
     {
         token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            {/* Imaginea de profil */}
            <div
              className="flex items-center gap-2"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img className="w-15 h-15 rounded-full" 
              src={patientData.profileImage ? patientData.profileImage : assets.user_default}
              alt="patient" />
              <img className="w-3" src={assets.dropdown_icon} alt="dropdown_icon" />
            </div>
      
            {/* Dropdown pentru mobil (click) */}
            <div
             ref={dropdownRef}
              className={`absolute right-0 top-8 mt-4 z-50 flex-col w-64 bg-white rounded-xl shadow-xl border border-gray-200 ${
                dropdownOpen ? 'flex' : 'hidden'
              } md:hidden`}
            >

             <div className="flex items-center gap-3 px-4 py-3 text-purple-900 hover:bg-purple-100 rounded-t-xl hover:font-semibold transition cursor-pointer">
                  <FontAwesomeIcon icon={faSun} size="xl" />
                  <span className="leading-tight">
                    <p className="text-lg leading-tight">Bine ai revenit,</p>
                    <p className="text-lg leading-tight ml-3">{patientData.lastName} {patientData.firstName}</p>
                  </span>
                </div>

              <div className="border-t border-gray-200 my-1"></div>

              {patientMenuItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      navigate(`profil-pacient/${patientData.patientID}/${item.path}`);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[var(--hover-color)] transition cursor-pointer hover:font-semibold hover:border-l-7 hover:text-purple-800"
                  >
                    <FontAwesomeIcon icon={item.icon} size="lg" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
      
              <div className="border-t border-gray-200 my-1"></div>
      
              <div
                onClick={() => {
                  setShowLogoutModal(true),
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl hover:font-semibold transition cursor-pointer hover:border-l-7 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faRightToBracket} size="lg" />
                <span className="text-sm">Deconectare</span>
              </div>
            </div>
      
            {/* Dropdown pentru desktop (hover) */}
            <div className="absolute right-0 top-10 mt-4 hidden md:group-hover:flex flex-col w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              
               <div className="flex items-center gap-3 px-4 py-3 text-purple-900 hover:bg-purple-100 rounded-t-xl hover:font-semibold transition cursor-pointer">
                  <FontAwesomeIcon icon={faSun} size="xl" />
                  <span className="leading-tight">
                    <p className="text-lg leading-tight">Bine ai revenit,</p>
                    <p className="text-lg leading-tight ml-3">{patientData.lastName} {patientData.firstName}</p>
                  </span>
                </div>

               <div className="border-t border-gray-200 my-1"></div>

              {patientMenuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                     navigate(`profil-pacient/${patientData.patientID}/${item.path}`);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[var(--hover-color)] transition cursor-pointer hover:font-semibold hover:border-l-7 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={item.icon} size="lg" />
                  <span className="text-base">{item.label}</span>
                </div>
              ))}
      
              <div className="border-t border-gray-200 my-1"></div>
      
              <div
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl hover:font-semibold transition cursor-pointer hover:border-l-7 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faRightToBracket} size="lg" />
                <span className="text-base">Deconectare</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/autentificare')}
            className="hidden md:block btn-outline-purple mr-3"
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            Intră în cont
          </button>
        )
     }


    <div className="md:hidden block cursor-pointer mr-2" onClick={() => setShowMenu(true)}>
      <FontAwesomeIcon icon={faBars} size="lg" className="text-gray-700" />
    </div>

{/* Meniu mobil */}






   </div>

    {showLogoutModal && (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
        <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sigur vrei să te deconectezi?</h2>
          <p className="text-sm text-gray-600 mb-6">Dacă alegi să ieși, va trebui să te conectezi din nou pentru a accesa contul.</p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowLogoutModal(false)}
               className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md cursor-pointer"
            >
              Anulează
            </button>

           <button
              onClick={() => {
                logout();
                setShowLogoutModal(false);
                navigate("/autentificare")

              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer"
            >
              Confirmă
          </button>
          </div>
        </div>
      </div>
    )}

     {loading && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center gap-3 animate-fade-in">
                <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">{loadingMessage}</p>
            </div>
          </div>
        )}

  </div>
  );
};

    export default Navbar