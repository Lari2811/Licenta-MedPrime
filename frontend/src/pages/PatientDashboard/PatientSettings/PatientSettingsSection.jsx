import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGear, faHouse, faPenToSquare, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContex';
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import Loader from '../../../components/lOADER.JSX';
import UpdatePassword from './UpdatePassword';
import UpdateEmail from './UpdateEmail';
import SendRequest from './SendRequest';
import { formatStatus } from '../../../utils/formatStatus';


const PatientSettingsSection = () => {

    useCheckPatientAccess();

    const { backendUrl } = useContext(AppContext);
    
    const navigate = useNavigate();
    
    const [patientData, setPatientData] = useState(null);
    const [userData, setUserData] = useState(null);
    const { label, color, icon } = formatStatus(patientData?.status);


   
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    

    //==========================
  
    const getPatientIDFromToken = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.linkedID;
      }
      return null;
    };

    useEffect(() => {
      const fetchAllData = async () => {
          const patientID = getPatientIDFromToken();
          if (!patientID) {
            toast.error('ID pacient inexistent. Reautentifică-te!');
            return;
          }
          let loadingTimer;

        
          try {
            loadingTimer = setTimeout(() => {
                setLoading(true);
                setLoadingMessage("Se încarcă datele...");
            }, 100);



            const [resPatient, resUser] = await Promise.all([
              axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`),
              axios.get(`${backendUrl}/api/main/get-user-by-ID/${patientID}`)
            ]);

            if (resPatient.data.success) {
              setPatientData(resPatient.data.data);
            } else {
              toast.error(resPatient.data.message || 'Pacientul nu a fost găsit.');
            }

            if (resUser.data.success) {
              setUserData(resUser.data.data);
            } else {
              toast.error(resUser.data.message || 'Userul nu a fost găsit.');
            }

          } catch (error) {
            console.error('Eroare API:', error);
            toast.error('Eroare la încărcarea datelor.');
          } finally {
            setLoading(false);
            clearTimeout(loadingTimer);
          }
        };

      fetchAllData();
    }, []);

   
  return (
    <div>
       {loading && <Loader message={loadingMessage} />}
       

        {(patientData && userData) &&
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
              <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                <FontAwesomeIcon icon={faHouse} />
                <span className="ml-1">Acasă</span>
              </Link>
              <span className="text-gray-400">{'>'}</span>
              <span className="text-purple-600 underline font-medium">
                <FontAwesomeIcon icon={faGear} />
                <span className="ml-1">Setări</span>
              </span>
            </nav>

            {/* Info */}
            <div className="border bg-gray-50 border-gray-200 border-2 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 flex flex-col text-gray-900">
                      
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-200 rounded-t-2xl shadow-md p-3 mb-3 flex flex-col sm:flex-row items-center gap-6">

                        {/* poza de profil + input */}
                        <div className="relative">
                          <img
                            src={patientData.profileImage || assets.user_default}
                            alt="Profil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <span className="absolute bottom-2 right-0  bg-blue-300 text-white rounded-full p-2 px-3 shadow-md">
                            <FontAwesomeIcon icon={faUser} />
                          </span>
                        </div>
            
                        {/* Info pacient */}
                        <div className="flex-1 flex flex-col items-center sm:items-start">
                          <h2 className="md:text-3xl text-2xl font-extrabold text-purple-700 mb-1">
                            {patientData ? `${patientData.lastName} ${patientData.firstName}` : 'Nume Prenume'}
                          </h2>
                          <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                            <span className="text-purple-700">
                              Pacient MedPrime: 
                            </span>
                            {patientData?.createdAt && (
                              <span className="text-gray-800 font-semibold">
                                din {new Date(patientData.createdAt).getFullYear()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                            <span className="text-purple-700">
                              Status: 
                            </span>
                            <span className={`flex items-center gap-1 ${color}`}>
                              <FontAwesomeIcon icon={icon} className="w-4 h-4 ml-1" />
                              <span className="font-semibold text-sm">{label}</span>
                            </span>
                          </div>
                        </div>
              </div>

              {/* Parola + Email */}
              <div className="flex flex-col md:flex-row gap-6 px-6 mt-6">
                <UpdatePassword patientData={patientData} />
                <UpdateEmail patientData={patientData}  />
              </div>

              {/* Trimite cerere */}
              <div className="px-6">
                <SendRequest patientData={patientData} />
              </div>
            </div>
      </>} 
    </div>
  )
}

export default PatientSettingsSection