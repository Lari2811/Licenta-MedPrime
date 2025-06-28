import React, { useState, useEffect, useRef, useContext } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faBriefcase,  faClock,  faEye,  faEyeSlash,  faHospital, faLock, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStethoscope,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";

import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess'

const AdminSettings = () => {

   useCheckAdminAccess();

   const { backendUrl } = useContext(AppContext);

   const [userData, setUserData] = useState([])
   const [adminData, setAdminData] = useState([])


   const [loading, setLoading] = useState(false);
   const [loadingMessage, setLoadingMessage] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errors, setErrors] = useState({});
    
   //preluare ID Admin din token
    const token = localStorage.getItem("authToken");
    let adminID = null;

    if (token) {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    adminID = decoded.linkedID; 
    }


   //API -get all specialities
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Încărcare date useri...");

      const res = await axios.get(`${backendUrl}/api/auth/get-all-users`);
      if (res.data.success) {
        const allUsers = res.data.data;
        
        const filteredUser = allUsers.find(user => user.linkedID === adminID && user.role === 'admin');
        
        if (filteredUser) {
          setUserData([filteredUser]);  
          console.log("Admin filtrat:", filteredUser);
        } else {
          toast.error("Nu am găsit adminul.");
        }

      } else {  
        toast.error(res.data.message || "Eroare la încărcarea userilor");
      }
    } catch (err) {  
      toast.error("Eroare server la useri");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const fetchAdmins= async () => {
    try {
      setLoading(true);
      setLoadingMessage("Încărcare date admin...");

      const res = await axios.get(`${backendUrl}/api/admin/get-all-admins`);
      if (res.data.success) {
        const allUsers = res.data.data;
        
        const filteredAdmin = allUsers.find(admin => admin.adminID === adminID);

        if (filteredAdmin) {
          setAdminData([filteredAdmin]);  
          console.log("Admin filtrat date:", filteredAdmin);
        } else {
          toast.error("Nu am găsit adminul.");
        }

      } else {  
        toast.error(res.data.message || "Eroare la încărcarea userilor");
      }
    } catch (err) {  
      toast.error("Eroare server la useri");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
        fetchUsers();
        fetchAdmins();
        
    }, []);

    //functia pentru puterea parolei =====================
  const handlePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return "Slabă";
    if (passwordStrength === 2) return "Mediocră";
    return "Puternică";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    return "bg-green-500";
  };
//========================================

const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      toast.error("Introdu parola actuală!");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Verificăm parola actuală...");

      console.log("Verificare parolă pentru adminID:", adminID);
      console.log("Parola actuală introdusă:", currentPassword);
      
      const res = await axios.post(`${backendUrl}/api/auth/verify-user-password`, {
        userID: adminID, 
        password: currentPassword,
      });


     
        setIsCurrentPasswordVerified(true);
        toast.success("Parola actuală este corectă. Poți continua.");
     
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.message || "Parola actuală este incorectă!");
        setIsCurrentPasswordVerified(false);
      } else
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.message || "User-ul nu a fost găsit!");
        setIsCurrentPasswordVerified(false);

      }
       else {
        toast.error("Eroare la verificarea parolei!");
        setIsCurrentPasswordVerified(false);
      }
    }
     finally {
          setLoading(false);
        }
  };

  const handleSaveNewPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast.error("Completează ambele câmpuri pentru parolă!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Parolele nu coincid!");
      return;
    }

    if (newPassword === currentPassword && confirmNewPassword === currentPassword) {
      toast.error("Parola nouă nu poate fi aceeași cu parola actuală!");
      return;
    }

    if (passwordStrength < 2) {
      toast.error("Parola este prea slabă!");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Actualizăm parola...");

      
      const res = await axios.patch(`${backendUrl}/api/auth/update-user-password`, {
        linkedID: adminID,        
        newPassword,              
        role: "admin",            
      });

    

    if (res.data.success) {
      toast.success(res.data.message || "Parola a fost actualizată cu succes!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsCurrentPasswordVerified(false);  
    } else {
      toast.error(res.data.message || "Eroare la actualizarea parolei.");
    }

  } catch (error) {
    console.error("Eroare la actualizare parolă:", error);

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "A apărut o eroare necunoscută.";

      if (status === 400) {
        toast.error(msg);
      } else if (status === 404) {
        toast.error(msg);
      } else if (status === 500) {
        toast.error("Eroare internă a serverului. Încearcă din nou mai târziu!");
      } else {
        toast.error("Eroare la actualizarea parolei.");
      }
    } else {
      toast.error("Eroare la actualizarea parolei. Verifică conexiunea la internet.");
    }
  } finally {
    setLoading(false);
  }
};
 


   
  return (
    <div className=''>
      {/* Intro - Cereri/Solicitări */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 ">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            <FontAwesomeIcon icon={faTools} className='mr-2 text-purple-600' /> Setări cont admin
          </h1>
          <p className="text-sm text-gray-500">Vizualizează și gestionează datele tale.</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white shadow-md rounded-2xl mt-7">

         <div className="flex justify-between items-center bg-purple-100 px-4 py-3 rounded-t-2xl ">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faUserDoctor} className='mr-2' />
                Informații cont
                <p className="text-sm text-gray-500">
                  Aici poți vizualiza și actualiza informațiile tale de contact și preferințele de notificare.
                </p> 
            </h3>
          </div>
        
        <div className="px-6 py-4">
          {/* Afiasre date admin */}
          {userData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
              <p><span className="font-semibold text-gray-700">Nume:</span> {adminData[0]?.firstName || "-"} {adminData[0]?.lastName || "-"}</p>
              <p><span className="font-semibold text-gray-700">Email:</span> {userData[0]?.email || "-"}</p>
              <p><span className="font-semibold text-gray-700">Telefon:</span> {adminData[0]?.phone || "-"}</p>
              <p><span className="font-semibold text-gray-700">Rol:</span> {userData[0]?.role || "-"}</p>
              <p><span className="font-semibold text-gray-700">ID Admin:</span> {userData[0]?.linkedID || "-"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modifica Parola */}
      <div className="bg-white shadow-md rounded-2xl mt-7">
        <div className="flex justify-between items-center bg-purple-100 px-4 py-3 rounded-t-2xl ">
          <h3 className="text-lg font-bold text-purple-800">
              <FontAwesomeIcon icon={faLock} className='mr-2' />
              Modificare parola
          </h3>
        </div>

        <div className="px-6 py-4">
          {/* Parola actuală */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Parola actuală</label>
            <div className="relative w-full">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Introdu parola actuală"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border p-2 rounded text-sm w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                <FontAwesomeIcon icon={showCurrentPassword ? faEye : faEyeSlash} />
              </button>
            </div>

            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-fit self-start mt-2"
              onClick={handleVerifyCurrentPassword}
            >
              Verifică parola
            </button>
          </div>

          {/* daca parola e verificata */}
            {isCurrentPasswordVerified && (
            <div className="flex flex-col gap-3 mt-5">
              {/* Parola noua */}
              <div className="mt-4">
                <label className="block font-medium text-gray-700 mb-1">Parolă nouă</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Introdu parola nouă"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      handlePasswordStrength(e.target.value);
                    }}
                    className={`w-full border rounded px-3 py-2 ${errors.newPassword ? "border-red-500" : "border"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEye : faEyeSlash}
                      className="text-gray-400"
                    />
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              {/* Confirmare parola noua */}
              <div className="mt-4">
                <label className="block font-medium text-gray-700 mb-1">Confirmă parola nouă</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmă parola nouă"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${errors.confirmNewPassword ? "border-red-500" : "border"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                      className="text-gray-400"
                    />
                  </button>
                </div>
                {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>}
              </div>

              {/* Puterea parolei */}
              {newPassword && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between">
                    <div className="text-xs text-gray-500">Puterea parolei:</div>
                    <div
                      className={`text-xs font-medium ${
                        passwordStrength <= 1
                          ? "text-red-500"
                          : passwordStrength === 2
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {getStrengthLabel()}
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Folosiți peste 8 caractere cu un amestec de litere, numere și simboluri
                  </div>
                </div>
              )}

              {/* Buton Salvare */}
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-fit self-end mt-3"
                onClick={handleSaveNewPassword}
              >
                Salvează parola
              </button>
            </div>
          )}
        </div>
      </div>

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
  )
}

export default AdminSettings