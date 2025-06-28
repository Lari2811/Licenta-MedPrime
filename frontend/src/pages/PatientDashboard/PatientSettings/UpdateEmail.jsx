import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faBook, faTimes, faCheck, faEyeSlash, faEye, faCheckCircle, faFloppyDisk, faSave, faTimesCircle, faMailBulk, faEnvelopeCircleCheck } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import { toast } from "react-toastify";

const UpdateEmail = ({patientData}) => {

    const { backendUrl } = useContext(AppContext);

    //parole ================================================
    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

    //email =================================================
    const [newEmail, setNewEmail] = useState("");

    const [errors, setErrors] = useState({});

    const handleVerifyCurrentPassword = async () => {
        if (!currentPassword) {
        toast.error("Introdu parola actuală!");
        return;
        }

        try {

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
      
    };

    const handleSaveNewEmail = async () => {
        if (!newEmail) {
            toast.error("Completează câmpul pentru email!");
            return;
        }

        if (newEmail === patientData.email) {
            toast.error("Email-ul nouă nu poate fi același cu email-ul actual!");
            return;
        }

        try {

            const res = await axios.put(`${backendUrl}/api/main/update-user-email`, {
            userID: patientData.patientID,
            newEmail,
            });

            if (res.status === 200) {
            toast.success(res.data.message || "Email-ul a fost actualizată cu succes!");
            setCurrentPassword("");
            setNewEmail("");
            setIsCurrentPasswordVerified(false);
            }
        } catch (error) {
            console.error("Eroare la actualizare email:", error);

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
                toast.error("Eroare la actualizarea email-ului.");
            }
            } else {
            toast.error("Eroare la actualizarea email. Verifică conexiunea la internet.");
            }
        } 
    };

  return (
     <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
           <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
               <h3 className="text-lg font-bold text-purple-800">
                   <FontAwesomeIcon icon={faEnvelopeCircleCheck} className="mr-2"/> Modificare email
               </h3>
           </div>
   
           {/* Continut */}
            <div className='p-5'>
                {/* Verificare parola */}
                <div className="flex flex-col gap-2">
                    {/* Parola actuala */}
                    <label className="font-semibold ">Parola actuală</label>
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
                        className="btn-outline-purple w-fit self-start mt-2"
                        onClick={handleVerifyCurrentPassword}
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Verifică parola
                    </button>
                </div>

                {/* daca parola e verificată */}
                {/* Setare Email */}
                {isCurrentPasswordVerified && (
                    <div className="flex flex-col gap-4 mt-6">
                           
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {/* Email nou */}
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Email nouă</label>
                                    <div className="relative">
                                    <input
                                        placeholder="Introdu email nouă"
                                        value={newEmail}
                                        onChange={(e) => {
                                        setNewEmail(e.target.value);
                                        
                                        }}
                                        className={`w-full border rounded px-3 py-2 ${errors.newEmail ? "border-red-500" : "border"}`}
                                    />
                                    </div>
                                </div>
                            </div>
            
                            {/* Butoane */}
                            <div className="flex justify-end gap-2">
                            <button
                                className="btn-outline-red "
                                onClick={() => {
                                setIsCurrentPasswordVerified(false);
                                setNewEmail("");
                                setCurrentPassword("")
                                }}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                                Anulează
                            </button>
            
                            <button
                                className="btn-outline-green text-green-600 border-green-600 hover:bg-green-600 hover:text-white flex items-center gap-1 px-4 py-2 rounded"
                                onClick={handleSaveNewEmail}
                            >
                                <FontAwesomeIcon icon={faFloppyDisk} />
                                Salvează email
                            </button>
                            </div>
                    </div>
                )}
           </div>
       </div>
  )
}

export default UpdateEmail