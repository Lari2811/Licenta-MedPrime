import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faBook, faTimes, faCheck, faEyeSlash, faEye, faCheckCircle, faFloppyDisk, faSave, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { toast } from "react-toastify";

const UpdatePassword =  ({patientData}) => {

    const { backendUrl } = useContext(AppContext);

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")

    

    //parole ================================================
    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errors, setErrors] = useState({});

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

       

        const res = await axios.post(`${backendUrl}/api/main/verify-user-password`, {
            userID: patientData.patientID,
            currentPassword,
        });
        //console.log("Răspuns verificare parolă:", res.data);
        //console.log("Doctor ID:", patientData.patientID);
        //console.log("Parola actuală:", currentPassword);

        
            setIsCurrentPasswordVerified(true);
            toast.success("Parola actuală este corectă. Poți continua.");
        
        } catch (error) {
        if (error.response && error.response.status === 400) {
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

            const res = await axios.put(`${backendUrl}/api/main/update-user-password`, {
            userID: patientData.patientID,
            newPassword,
            });

            if (res.status === 200) {
            toast.success(res.data.message || "Parola a fost actualizată cu succes!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setIsCurrentPasswordVerified(false);
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
    <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
        <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faLock} className="mr-2"/> Modificare parolă
            </h3>
        </div>

        {/* Continut */}
        <div className='p-5'>
            <div className="flex flex-col gap-2">
                {/* Parola actuala */}
                <label className="font-semibold ">Parola actuală</label>
                <div className="relative w-full">
                    <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
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
                    className="btn-outline-purple w-fit self-start mt-2"
                    onClick={handleVerifyCurrentPassword}
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Verifică parola
                </button>
            </div>

        
            {/* daca parola e verificată */}
            {isCurrentPasswordVerified && (
            <div className="flex flex-col gap-4 mt-6">
                {/* Parola noua + Confirmare side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parola noua */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-1">Parolă nouă</label>
                    <div className="relative">
                    <input
                        name="newPassword"
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
                        <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} className="text-gray-400" />
                    </button>
                    </div>
                </div>

                {/* Confirmare */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-1">Confirmă parola nouă</label>
                    <div className="relative">
                    <input
                        name="confirmPassword"
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
                        <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="text-gray-400" />
                    </button>
                    </div>
                </div>
                </div>

                {/* Puterea parolei */}
                {newPassword && (
                <div className="space-y-1">
                    <div className="flex justify-between">
                    <div className="text-xs text-gray-500">Puterea parolei:</div>
                    <div
                        className={`text-xs font-semibold ${
                        passwordStrength <= 1 ? "text-red-500" : passwordStrength === 2 ? "text-yellow-500" : "text-green-500"
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

                {/* Butoane */}
                <div className="flex justify-end gap-2">
                <button
                    className="btn-outline-red "
                    onClick={() => {
                    setIsCurrentPasswordVerified(false);
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setPasswordStrength(0);
                    setCurrentPassword("")
                    }}
                >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Anulează
                </button>

                <button
                    className="btn-outline-green text-green-600 border-green-600 hover:bg-green-600 hover:text-white flex items-center gap-1 px-4 py-2 rounded"
                    onClick={handleSaveNewPassword}
                >
                    <FontAwesomeIcon icon={faFloppyDisk} />
                    Salvează parola
                </button>
                </div>
            </div>
            )}
        </div>
    </div>
  )
}

export default UpdatePassword