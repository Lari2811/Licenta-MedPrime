import React, { useContext } from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { assets } from '../../assets/assets';

import { faRightToBracket, faEyeSlash, faEye, faTimes} from '@fortawesome/free-solid-svg-icons';
import { faIdCard } from "@fortawesome/free-regular-svg-icons";
import { AppContext } from '../../context/AppContex';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';

const Register = () => {

  const { backendUrl, login } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigate = useNavigate();
    
  const [activeTab, setActiveTab] = useState("register");

  const [showPassword, setShowPassword] = useState(false);

  //register password =============================================
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const getStrengthLabel = () => {
      if (passwordStrength === 0) return "Slabă";
      if (passwordStrength === 1) return "Ok";
      if (passwordStrength === 2) return "Bună";
      if (passwordStrength === 3) return "Puternică";
      return "Foarte Puternică";
    };
  const getStrengthColor = () => {
      if (passwordStrength === 0) return "bg-red-500";
      if (passwordStrength === 1) return "bg-orange-500";
      if (passwordStrength === 2) return "bg-yellow-500";
      if (passwordStrength === 3) return "bg-green-500";
      return "bg-green-600";
  };

  const handlePasswordChange = (e) => {
      const newPassword = e.target.value;
      setPassword(newPassword);
      let strength = 0;
      if (newPassword.length > 6) strength += 1;
      if (newPassword.match(/[A-Z]/)) strength += 1;
      if (newPassword.match(/[0-9]/)) strength += 1;
      if (newPassword.match(/[^A-Za-z0-9]/)) strength += 1;
      setPasswordStrength(strength);
    };

  //=========================================================

    //Register =========================================================
    const [registerFirstName, setRegisterFirstName] = useState("");
    const [registerLastName, setRegisterLastName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [registerAgreed, setRegisterAgreed] = useState(false);
  
    //Register Error
    const [registerFirstNameError, setRegisterFirstNameError] = useState("");
    const [registerLastNameError, setRegisterLastNameError] = useState("");
    const [registerEmailError, setRegisterEmailError] = useState("");
    const [registerPasswordError, setRegisterPasswordError] = useState("");
    const [registerConfirmPasswordError, setRegisterConfirmPasswordError] = useState("");
    const [registerAgreedError, setRegisterAgreedError] = useState("");

    //======================================================================
      
     const handleRegister = async (e) => {
        e.preventDefault();
      
        let valid = true;
      
        setRegisterFirstNameError("");
        setRegisterLastNameError("");
        setRegisterEmailError("");
        setRegisterPasswordError("");
        setRegisterConfirmPasswordError("");
        setRegisterAgreedError("");
      
        if (registerLastName.trim() === "") {
          setRegisterLastNameError("Introduceți numele.");
          valid = false;
        }
      
        if (registerFirstName.trim() === "") {
          setRegisterFirstNameError("Introduceți prenumele.");
          valid = false;
        }
      
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerEmail)) {
          setRegisterEmailError("Adresa de email este invalidă.");
          valid = false;
        }
      
        if (registerPassword.trim() === "") {
          setRegisterPasswordError("Introduceți o parolă.");
          valid = false;
        }

        if (passwordStrength < 1) {
          setRegisterPasswordError("Parola este prea slabă.");
          valid = false;
        }
      
        if (registerConfirmPassword.trim() === "") {
          setRegisterConfirmPasswordError("Confirmați parola.");
          valid = false;
        } else if (registerConfirmPassword !== registerPassword) {
          setRegisterConfirmPasswordError("Parolele nu coincid.");
          valid = false;
        } else {
          setRegisterConfirmPasswordError("");
        }
              
       if (!registerAgreed) {
          setRegisterAgreedError("Trebuie să acceptați termenii și condițiile.");
          valid = false;
        } else {
          setRegisterAgreedError("");
        }
      
        if (valid) {

          setLoading(true);
          setLoadingMessage("Se procesează înregistrarea...");

           try {
            const res = await axios.post(`${backendUrl}/api/patient/register-patient`, {
              firstName: registerFirstName,
              lastName: registerLastName,
              email: registerEmail,
              password: registerPassword,
            });

            if (res.data.success) {
              const { token, role, linkedID } = res.data;
              
              // salveaza token-ul si rolul în localStorage
              localStorage.setItem("authToken", token);
              localStorage.setItem("role", role);

              // salveaza token-ul în context
              login(token);

              toast.success("Înregistrare reușită! Vă rugăm să completați profilul.");

              navigate(`/profil-pacient/${linkedID}/completare-profil`);
            } 

          } catch (error) {
              console.error("Eroare la request:", error);

              const status = error.response?.status;
              const message = error.response?.data?.message || error.message || "Eroare necunoscută.";

              if (status === 400) {
                toast.error(message);
              } else if (status === 401) {
                toast.error(message);
              } else if (status === 500) {
                toast.error("Eroare internă a serverului. Vă rugăm să încercați mai târziu.");
              } else {
                toast.error(`Eroare: ${message}`);
              }
            }
          finally
          {
            setLoading(false);
          }
        }
      };

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Buton colt dreapta sus */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 btn-outline-purple"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="text-purple-700" />
          Înapoi la site-ul principal
        </button>

      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={assets.login_img}
          alt="Medical Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"></div>
      </div>

        {/* Form */}
         <div className="w-full max-w-md mx-4 md:py-7">
           <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
   
             {/* Tab Selector */}
             <div className="flex mb-6 bg-gray-200 rounded-xl p-1 md:text-base text-base">
               <button
                 onClick={() => navigate("/autentificare")}
                 className={`w-1/2 p-2 text-center rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap !rounded-button 
                 ${
                   activeTab === "login"
                     ? "bg-white text-purple-700 shadow-lg"
                     : "text-gray-500 hover:text-gray-700"
                 }`}
               >
                 Autentificare
               </button>
               
               <button
                 onClick={() => setActiveTab("register")}
                 className={`w-1/2 p-2 text-center rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap !rounded-button 
                   ${
                   activeTab === "register"
                     ? "bg-white text-purple-700 shadow-sm"
                     : "text-gray-500 hover:text-gray-700"
                 }`}
               >
                 Înregistrare
               </button>
             </div>
   
             {/* Login */}
             {activeTab === "login" && (
                <div></div>
            )}
   
            {/* Register */}
             {activeTab === "register" && (
               <div className="space-y-5">
                    <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-10">
                    <FontAwesomeIcon icon={faIdCard} className="text-purple-700 mr-2 ml-2" />
                    Creați-vă contul
                    </h2>
               
                    {/* Nume si Prenume */}
                    <div className="grid grid-cols-2 gap-4">
                    {/* Nume */}
                    <div className="relative">
                        <label className="block text-sm font-medium mb-0 ml-1">Nume *</label>
                        <input
                        type="text"
                        id="register-last-name"
                        value={registerLastName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegisterLastName(value);

                          if (value.trim() === "") {
                            setRegisterLastNameError("Introduceți numele.");
                          } else {
                            setRegisterLastNameError("");
                          }
                        }}
                        className={`w-full border rounded px-3 py-2 
                            ${registerLastNameError ? "border-red-500" : "border"}`}
                        placeholder=" "
                        required
                        />
                        {registerLastNameError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerLastNameError}</p>
                        )}
                    </div>

                    {/* Prenume */}
                    <div className="relative">
                        <label className="block text-sm font-medium mb-0 ml-1">Prenume *</label>
                        <input
                        type="text"
                        id="register-first-name"
                        value={registerFirstName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegisterFirstName(value);

                          if (value.trim() === "") {
                            setRegisterFirstNameError("Introduceți prenumele.");
                          } else {
                            setRegisterFirstNameError("");
                          }
                        }}
                        className={`w-full border rounded px-3 py-2 ${registerFirstNameError ? "border-red-500" : "border"} `}
                        placeholder=" "
                        required
                        />
                        {registerFirstNameError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerFirstNameError}</p>
                        )}
                    </div>
                    </div>
               
                    {/* Email */}
                    <div className="relative mb-0 mt-4">
                        <label className="block text-sm font-medium mb-0 ml-1">Email *</label>
                        <input
                        type="email"
                        id="register-email"
                        value={registerEmail}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegisterEmail(value);

                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (value.trim() === "") {
                            setRegisterEmailError("Introduceți emailul.");
                          } else if (!emailRegex.test(value)) {
                            setRegisterEmailError("Adresa de email este invalidă.");
                          } else {
                            setRegisterEmailError("");
                          }
                        }}
                        className={`w-full border rounded px-3 py-2 ${registerEmailError ? "border-red-500" : "border"} `}
                        placeholder=""
                        required
                        />
                        {registerEmailError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerEmailError}</p>
                        )}
                    </div>
               
                    {/* Parola */}
                    <div className="space-y-2 mb-0">
                    <div className="relative mb-0 mt-4">
                        <label className="block text-sm font-medium mb-0 ml-1">Parolă *</label>
                        <input
                        type={showPassword ? "text" : "password"}
                        id="register-password"
                        value={registerPassword}
                        onChange={(e) => {
                          handlePasswordChange(e); 
                          const value = e.target.value;
                          setRegisterPassword(value);

                          if (value.trim() === "") {
                            setRegisterPasswordError("Introduceți o parolă.");
                          } else if (passwordStrength < 1 ) {
                            setRegisterPasswordError("Parola este prea slabă.");
                          } else {
                            setRegisterPasswordError("");
                          }
                        }}
                        className={`w-full border rounded px-3 py-2 ${registerPasswordError ? "border-red-500" : "border"} `}
                        placeholder=" "
                        required
                        />
            
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 mt-5 flex items-center cursor-pointer"
                        >
                        <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash}
                            className="text-gray-400"
                        />
                        </button>
                        
                    </div>
                    {registerPasswordError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerPasswordError}</p>
                        )}
    
                    {password && (
                        <div className="space-y-1 mt-2">
                        <div className="flex justify-between">
                            <div className="text-xs text-gray-500">
                            Puterea parolei:
                            </div>
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
                    </div>
               
                    {/* Confirmare parola */}
                    <div className="relative mt-6 mb-0">
                    <label className="block text-sm font-medium mb-0 ml-1">Confirmă Parola *</label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        value={registerConfirmPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegisterConfirmPassword(value);

                          if (value.trim() === "") {
                            setRegisterConfirmPasswordError("Confirmați parola.");
                          } else if (value !== registerPassword) {
                            setRegisterConfirmPasswordError("Parolele nu coincid.");
                          } else {
                            setRegisterConfirmPasswordError("");
                          }
                        }}
                        className={`w-full border rounded px-3 py-2 ${registerConfirmPasswordError ? "border-red-500" : "border"} `}
                        placeholder=""
                        required
                    />
                    
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 mt-5 flex items-center cursor-pointer"
                        >
                        <FontAwesomeIcon
                            icon={showConfirmPassword ? faEye : faEyeSlash}
                            className="text-gray-400"
                        />
                        </button>
                    </div>
                    {registerConfirmPasswordError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerConfirmPasswordError}</p>
                        )}
               
                    {/* Acord */}
                    <div className="flex items-start mb-0 mt-5">
                    <div className="flex items-center h-5">
                        <input
                        id="terms"
                        type="checkbox"
                        checked={registerAgreed}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRegisterAgreed(checked);

                          if (!checked) {
                            setRegisterAgreedError("Trebuie să acceptați termenii și condițiile.");
                          } else {
                            setRegisterAgreedError("");
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                        required
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label
                        htmlFor="terms"
                        className="text-gray-600 cursor-pointer"
                        >
                        Accept {" "}
                        <a
                            href="#"
                            className="text-purple-600 hover:text-purple-500"
                        >
                            Termeni și condiții
                        </a>{" "}
                        și{" "}
                        <a
                            href="#"
                            className="text-purple-600 hover:text-purple-500"
                        >
                            Politica de confidențialitate
                        </a>
                        </label>
                        
                    </div>
                    </div>
                    {registerAgreedError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{registerAgreedError}</p>
                        )}
    
                    {/* Creaza cont */}
                    <button
                      type="submit"
                      onClick={handleRegister}
                      className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-102 transition-all duration-300 cursor-pointer whitespace-nowrap"
                    >
                      <FontAwesomeIcon icon={faRightToBracket} className="text-white" />
                    Crează cont
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

export default Register