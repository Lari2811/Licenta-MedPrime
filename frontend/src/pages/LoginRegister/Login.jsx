import React from 'react'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import axios from "axios";
import { toast } from "react-toastify";

import { assets } from '../../assets/assets';

import { faRightToBracket, faEyeSlash, faEye, faTimes, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebookF, faApple } from '@fortawesome/free-brands-svg-icons';
import { faIdCard } from "@fortawesome/free-regular-svg-icons";

import { useContext } from 'react';
import { AppContext } from '../../context/AppContex';
 
const Login = () => {

    const { login } = useContext(AppContext);
    const { backendUrl} = useContext(AppContext);
    
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("login");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [loginEmailError, setLoginEmailError] = useState("");
    const [loginPasswordError, setLoginPasswordError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        let valid = true;
        setLoginEmailError("");
        setLoginPasswordError("");
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginEmail)) {
            setLoginEmailError("Adresa de email este invalidă.");
            valid = false;
        }
        
        if (loginPassword.trim() === "") {
            setLoginPasswordError("Introduceți o parolă.");
            valid = false;
        }

        if (valid) {
            try {
            const res = await axios.post(`${backendUrl}/api/auth/login`, {
                email: loginEmail,
                password: loginPassword
            });

            if (res.data.success) {
                const { token, role, userID, mustCompleteProfile } = res.data;

                //salvare context
                login(token); 
                
                //salvam in LocalStorage
                localStorage.setItem("authToken", token);
                localStorage.setItem("role", role);
                
                console.log("Autentificare cu:", "email:", loginEmail, "parola:", loginPassword);
                console.log("Completare: ", mustCompleteProfile)

                // navigare în functie de rol
                if (role === "doctor") {
                     if (mustCompleteProfile) {
                        navigate(`/profil-medic/${userID}/completare-profil`);
                      } else {
                        navigate(`/profil-medic/${userID}/dashboard`);
                      }

                } else if (role === "admin") {
                    navigate(`/admin/${userID}/dashboard`);

                } else if (role === "patient") {
                  const redirect = localStorage.getItem("redirectAfterLoginApp") === "true";

                  if (redirect) {
                    localStorage.setItem("redirectAfterLoginApp", "false"); 
                    navigate(`/profil-pacient/${userID}/programarile-mele/creeaza-programare`); 
                  } else if (mustCompleteProfile) {
                    navigate(`/profil-pacient/${userID}/completare-profil`);
                  } else {
                    navigate(`/profil-pacient/${userID}/informatii-personale`);
                  }
                } else {
                    console.error("Rol necunoscut:", role);
                }

            } else {
                toast.error(res.data.message || "Autentificare eșuată.");
            }
            

            } catch (error) {
                
                toast.error(error.response?.data?.message || "Eroare la conectare.");
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
              onClick={() => setActiveTab("login")}
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
              onClick={() => navigate("/inregistrare")}
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
            <div className="space-y-5 ">
                  <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-10 ">
                    <FontAwesomeIcon icon={faRightToBracket} className="text-purple-700 mr-2 ml-2" />
                    Autentifică-te în contul tău 
                  </h2>
    
                  {/* Email */}
                  <div className="relative">
                    <label className="block text-sm font-medium mb-0 ml-1">Email *</label>
                    <input
                        type="email"
                        name="email"
                        id="login-email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`w-full border rounded px-3 py-2
                           ${ loginEmailError ? "border-red-500" : "border"
                        }`}
                        placeholder=" "
                        required
                      />
                     {loginEmailError && (
                      <p className="text-red-500 text-sm mt-0 ml-1">{loginEmailError}</p>
                    )}
                  </div>
                    
    
                  {/* Parola */}
                  <div className="relative mb-0 mt-4">
                      <label className="block text-sm font-medium mb-0 ml-1">Parolă *</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        name="parola"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`w-full border rounded px-3 py-2
                           ${loginPasswordError ? "border-red-500" : "border"
                        } `}
                        placeholder=" "
                        required
                      />
    
                    <button
                        type="button"
                        id="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 mt-5 flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          className="text-gray-400"
                        />
                      </button>
                     
                  </div>
                    {loginPasswordError && (
                        <p className="text-red-500 text-sm mt-0 ml-1">{loginPasswordError}</p>
                      )}
    
                  
                  {/* Sign in */}
                  <button
                    type="submit"
                    onClick={handleLogin}
                    className="w-full mt-7 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-102 transition-all duration-300 cursor-pointer whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faRightToBracket} className="text-white" />
                    Autentificare
                  </button>
    
                </div>
         )}

         {/* Register */}
          {activeTab === "register" && (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login
