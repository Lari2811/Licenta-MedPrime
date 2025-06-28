import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleCheck, faHouse, faPenToSquare, faTimes, faTimesCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContex';

import PersonalInfo from './PersonalInfo';
import AddressInfo from './AddressInfo';
import ProfessionalInfo from './ProfessionalInfo';
import MedicalInfo from './MedicalInfo';
import Loader from '../../../components/lOADER.JSX';
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import { formatStatus } from '../../../utils/formatStatus';

const PatientInfoSection = () => {
    
  useCheckPatientAccess();

  const { backendUrl } = useContext(AppContext);

  const navigate = useNavigate();
 
  const [patientData, setPatientData] = useState(null)
  const { label, color, icon } = formatStatus(patientData?.status);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { patientID } = useParams();

  
  const fetchPatientData = async () => {

    try {

    
        setLoading(true);
        setLoadingMessage("Se încarcă datele...");


      const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);
      
      if (response.status === 200 && response.data.success) {
        console.log("Pacient:", response.data.data)
        setPatientData(response.data.data);
      } else {
        toast.error(response.data.message || 'Pacientul nu a fost găsit.');
      }
    } catch (error) {
      console.error('Eroare API:', error);
      toast.error('Eroare la încărcarea datelor pacientului.');
    } finally{
      setLoading(false);
    }
  } ;
    
  useEffect(() => {
      fetchPatientData();
  }, []);

   
  const handleSavePatientInfo = async (data) => {
     let loadingTimer;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("patientDataForm", JSON.stringify(data));
      formDataUpload.append("oldProfileImage", data.profileImageUrl || "");

      loadingTimer = setTimeout(() => {
        setLoading(true);
        setLoadingMessage("Se actualizează datele personale...");
      },  100); 

      const res = await axios.put(
        `${backendUrl}/api/patient/update-patient-profile/${patientData.patientID}`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        toast.success("Datele personale au fost actualizate cu succes!");
        await fetchPatientData();
        localStorage.setItem("NavbarRefresh", "true");
      }
    } catch (error) {
      console.error("Eroare la actualizarea datelor personale:", error);
      toast.error("Eroare la actualizarea datelor personale.");
    } finally {
      setLoading(false);
      clearTimeout(loadingTimer);
    }
  };


  const handleSubmitImage = async () => {
    const formDataUpload = new FormData();

    if (profileImage instanceof File) {
      formDataUpload.append("profileImage", profileImage);
    }

    formDataUpload.append("patientDataForm", JSON.stringify(patientData));
    formDataUpload.append("oldProfileImage", patientData.profileImage || "");

    let loadingTimer;

    try {
      loadingTimer = setTimeout(() => {
        setLoading(true);
        setLoadingMessage("Se actualizează imaginea de profil...");
      }, 100);

      const res = await axios.put(
        `${backendUrl}/api/patient/update-patient-profile/${patientData.patientID}`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        toast.success("Profilul a fost actualizat cu succes!");
        await fetchPatientData(); 
        setIsEditingProfileImage(false);
        setProfileImage(null);
        setMainImagePreview(null);
        localStorage.setItem("NavbarRefresh", "true");
      }
    } catch (error) {
      console.error("Eroare la update profil pacient:", error);
      toast.error("Eroare la actualizare profil.");
    } finally {
      setLoading(false);
      clearTimeout(loadingTimer);
    }
  };

  const [isEditingProfileImage, setIsEditingProfileImage] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null); 


  return (
    <div>
        {loading && <Loader message={loadingMessage} />}

        {(patientData) &&
        <>
            {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
                <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                  <FontAwesomeIcon icon={faHouse} />
                  <span className="ml-1">Acasă</span>
                </Link>
                <span className="text-gray-400">{'>'}</span>
                <span className="text-purple-600 underline font-medium">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="ml-1">Profilul Meu</span>
                </span>
              </nav>

              {/* Info */}
              <div className=" border bg-gray-50 border-gray-200 border-2 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 flex flex-col text-gray-900">
                
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-200 rounded-t-2xl shadow-md p-3 flex flex-col sm:flex-row items-center gap-6">

                  {/* poza de profil + input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="profileImageInput"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileImage(file);
                          setIsEditingProfileImage(true);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMainImagePreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                      
                    <img
                      src={mainImagePreview || patientData.profileImage || assets.user_default}
                      alt="Profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <span className="absolute md:bottom-2 bottom-12 right-0  bg-blue-300 text-white rounded-full p-2 px-3 shadow-md">
                      <FontAwesomeIcon icon={faUser} />
                    </span>

                    {/* Butoane pe mobile: sub poza */}
                    <div className="flex sm:hidden flex-col items-center mt-4 gap-2">
                      {!isEditingProfileImage ? (
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById('profileImageInput').click();
                            setIsEditingProfileImage(true);
                          }}
                          className="bg-purple-200 hover:underline text-purple-600 px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                          Editează
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setIsEditingProfileImage(false);
                              setProfileImage(null);
                              setMainImagePreview(null);
                            }}
                            className="bg-gray-200 text-gray-700 px-4 py-2.2 rounded-lg hover:bg-gray-300 hover:text-gray-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                          <button
                            onClick={handleSubmitImage}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm border border-purple-700 flex items-center"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Butoane pe desktop: sus dreapta */}
                  <div className="hidden sm:flex absolute top-4 right-4 gap-2">
                    {!isEditingProfileImage ? (
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById('profileImageInput').click();
                          setIsEditingProfileImage(true);
                        }}
                        className="bg-purple-200 hover:underline text-purple-600 px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                        Editează
                      </button>
                    ) : (
                      <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setIsEditingProfileImage(false);
                              setProfileImage(null);
                              setMainImagePreview(null);
                            }}
                            className="bg-gray-200 text-gray-700 px-4 py-2.2 rounded-lg hover:bg-gray-300 hover:text-gray-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                          <button
                            onClick={handleSubmitImage}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm border border-purple-700 flex items-center"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </div>
                    )}
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

               
              <div className="px-5 py-1">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b-1 border-gray-300 p-5 mb-3">
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {/* Icon */}
                        <FontAwesomeIcon
                            icon={faUser}
                            className="text-purple-600 md:text-3xl text-3xl sm:mb-0"
                        />
        
                        {/* Text */}
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                            Profilul Meu
                        </h2>
                    </div>
                    
                </div>


                {/* SECTIONS: Personal Info + Address */}
                <div className="flex flex-col md:flex-row gap-6  mt-6">
                  <PersonalInfo patientData={patientData} onSave={handleSavePatientInfo} />
                  <MedicalInfo patientData={patientData} onSave={handleSavePatientInfo} />
                </div>

                {/* Informatii rpofesionale si medicale */}
                <div className="flex flex-col md:flex-row gap-6 mb-2 mt-2">
                  <ProfessionalInfo patientData={patientData} onSave={handleSavePatientInfo} />
                  <AddressInfo patientData={patientData} onSave={handleSavePatientInfo} />
                </div>
                </div>
            </div>
      </>}
    </div>
  );
};

export default PatientInfoSection